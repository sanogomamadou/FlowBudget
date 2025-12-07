# agent/tools.py
from langchain.tools import tool
from agent.utils import get_db_connection
from datetime import datetime, timedelta
import calendar
import json


@tool
def analyze_expenses(input_str: str) -> str:
    """Analyse les dépenses de l'utilisateur entre deux dates. 
    L'input doit être au format: 'user_id|start_date|end_date'
    Exemple: '1|2025-05-01|2025-05-30'"""
    try:
        # Parse the input string
        parts = input_str.split('|')
        if len(parts) != 3:
            return "Format d'entrée invalide. Utilisez: 'user_id|start_date|end_date'"
        
        user_id = int(parts[0])
        start_date = parts[1]
        end_date = parts[2]

        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT categorie, SUM(montant)
            FROM transactions
            WHERE user_id = %s AND type = 'Dépense' AND date BETWEEN %s AND %s
            GROUP BY categorie
        """
        cursor.execute(query, (user_id, start_date, end_date))
        results = cursor.fetchall()
        cursor.close()
        conn.close()

        if not results:
            return "Aucune dépense trouvée pour cette période."
        
        response = f"""Dépenses de l'utilisateur #{user_id} entre {start_date} et {end_date} :\n"""
        for categorie, total in results:
            response += f"- {categorie} : {total:.2f} MAD\n"
        return response
    except Exception as e:
        return f"Erreur lors de l'analyse des dépenses : {str(e)}"
    

@tool
def setBudget(input_str: str) -> str:
    """Permet de mettre à jour ou définir un budget prévisionnel pour un mois donné pour l'une des catégories suivantes ["Abonnement","Alimentation","Factures","Fournitures","Loyer","Santé","Soins corporels","Loisir","Transport","Vêtements","Autres"].
    L'input doit être au format: 'user_id|categorie|budget_montant'
    Exemple: '1|Alimentation|5000.00'"""
    try:
        # Parse l'entrée
        parts = input_str.split('|')
        if len(parts) != 3:
            return "Format d'entrée invalide. Utilisez: 'user_id|categorie|budget_montant'"

        user_id = int(parts[0])
        categorie = parts[1]
        budget_montant = float(parts[2])

        # Connexion à la base de données
        conn = get_db_connection()
        cursor = conn.cursor()

        # Obtenir le mois actuel
        current_month = datetime.now().strftime('%Y-%m-01')  # Format DATE SQL

        # Solution optimisée avec ON DUPLICATE KEY UPDATE
        query = """
            INSERT INTO budgets (user_id, category, amount, month)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE amount = VALUES(amount)
        """
        cursor.execute(query, (user_id, categorie, budget_montant, current_month))
        conn.commit()
        
        cursor.close()
        conn.close()
        return f"Budget '{categorie}' mis à jour à {budget_montant:.2f} MAD pour {current_month[:7]}"
        
    except Exception as e:
        return f"Erreur lors de la mise à jour du budget : {str(e)}"
    
@tool
def estimerEconomies(input_str: str) -> str:
    """Estime les économies possibles. Deux modes:
    1. 'user_id|categorie|reduction_montant' → économie fixe
    2. 'user_id|categorie|target_montant|TARGET' → économie pour atteindre un budget cible
    Exemples: 
    - '1|Alimentation|200' → réduit de 200 MAD
    - '1|Alimentation|200|TARGET' → réduit à 200 MAD"""
    try:
        parts = input_str.split('|')
        if len(parts) not in [3,4]:
            return "Format invalide. Utilisez : 'user_id|categorie|montant' ou 'user_id|categorie|target|TARGET'"

        user_id = int(parts[0])
        categorie = parts[1]
        mode_target = len(parts) == 4 and parts[3] == "TARGET"

        conn = get_db_connection()
        cursor = conn.cursor()

        # Requête pour obtenir la dépense mensuelle maximale
        query = """
            SELECT MAX(montant_total) FROM (
                SELECT SUM(montant) AS montant_total
                FROM transactions
                WHERE user_id = %s AND categorie = %s
                GROUP BY DATE_FORMAT(date, '%Y-%m')
            ) AS monthly_totals;
        """
        cursor.execute(query, (user_id, categorie))
        result = cursor.fetchone()
        max_depense = float(result[0]) if result and result[0] else 0

        if mode_target:
            target = float(parts[2])
            if target >= max_depense:
                return f"Votre cible ({target:.2f} MAD) est supérieure à votre dépense maximale actuelle ({max_depense:.2f} MAD)."
            reduction = max_depense - target
        else:
            reduction = float(parts[2])
            if reduction > max_depense:
                return f"Impossible de réduire de {reduction:.2f} MAD (dépense max: {max_depense:.2f} MAD)"

        economie_annuelle = reduction * 12
        
        return (
            f"En réduisant vos dépenses {f'à {target:.2f}' if mode_target else f'de {reduction:.2f}'} MAD/mois "
            f"dans '{categorie}', vous économiseriez **{economie_annuelle:.2f} MAD**/an. 💰"
        )

    except Exception as e:
        return f"Erreur de calcul: {str(e)}"
    
@tool
def ajouterTransaction(input_str: str) -> str:
    """Ajoute une transaction
    - dépense pour un utilisateur dans l'une de ces catégories ["Abonnement","Alimentation","Factures","Fournitures","Loyer","Santé","Soins corporels","Loisir","Transport","Vêtements","Autres"] 
    - ou revenu pour un utilisateur dans l'une de ces catégories ["Investissement","Don","Salaire"]

    Format : 'user_id|type|categorie|montant'
    Exemple : '1|Dépense|Alimentation|250.00'"""
    try:
        parts = input_str.split('|')
        if len(parts) != 4:
            return "Format invalide. Utilisez : 'user_id|type|categorie|montant'"

        user_id = int(parts[0])
        type_trans = parts[1].capitalize()
        categorie = parts[2]
        montant = float(parts[3])

        if type_trans not in ['Dépense', 'Revenu']:
            return "Le type doit être soit 'Dépense' soit 'Revenu'."

        conn = get_db_connection()
        cursor = conn.cursor()

        date_now = datetime.now().strftime('%Y-%m-%d')

        query = """
            INSERT INTO transactions (user_id, type, categorie, montant, date)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, type_trans, categorie, montant, date_now))
        conn.commit()
        cursor.close()
        conn.close()

        return f"{type_trans} de {montant:.2f} MAD ajoutée dans la catégorie '{categorie}' pour l'utilisateur #{user_id} le {date_now}."

    except Exception as e:
        return f"Erreur lors de l'ajout de la transaction : {str(e)}"



@tool
def conseillerBudget(input_str: str) -> str:
    """Analyse les dépenses d'utilisateur sur les 3 derniers mois , les compare à des moyennes et donne des conseils de gestion.
    Input : user_id"""
    try:
        user_id = int(input_str)

        conn = get_db_connection()
        cursor = conn.cursor()

        # Calcul des 3 derniers mois
        today = datetime.today()
        months = []
        for i in range(3):
            month = today.month - i
            year = today.year
            if month <= 0:
                month += 12
                year -= 1
            first_day = f"{year}-{month:02d}-01"
            last_day = f"{year}-{month:02d}-{calendar.monthrange(year, month)[1]}"
            months.append((first_day, last_day))

        full_report = ""

        # Normes fictives de budget étudiant
        normes = {
            'Alimentation': 500,
            'Transport': 300,
            'Loisirs': 300,
            'Abonnement': 100,
        }

        # Analyse de chaque mois
        for start_date, end_date in reversed(months):
            cursor.execute("""
                SELECT categorie, SUM(montant)
                FROM transactions
                WHERE user_id = %s AND type = 'Dépense' AND date BETWEEN %s AND %s
                GROUP BY categorie
            """, (user_id, start_date, end_date))
            results = cursor.fetchall()

            report = f"\n📆 **Période : {start_date} au {end_date}**\n"
            total = 0

            for cat, montant in results:
                total += montant
                norme = normes.get(cat, 0)
                ecart = montant - norme
                tendance = "⬆️ au-dessus" if ecart > 0 else "⬇️ en-dessous"
                report += f"- {cat} : {montant:.2f} MAD ({tendance} de {abs(ecart):.2f} MAD vs norme de {norme} MAD)\n"

            report += f"**Total dépenses** : {total:.2f} MAD\n"
            full_report += report

        cursor.close()
        conn.close()

        prompt = f"""Tu es un expert en gestion financière pour étudiants.
Voici le détail des dépenses d’un étudiant sur les 3 derniers mois par catégorie, avec comparaison aux normes :

{full_report}

Donne-lui des conseils précis et bienveillants pour améliorer sa gestion financière."""

        from agent.langchain_agent import llm
        conseils = llm.invoke(prompt)

        return f"{full_report}\n💡 **Conseils de gestion générés par l'IA** :\n{conseils}"
        

    except Exception as e:
        return f"Erreur dans conseillerBudget : {str(e)}"
    

@tool
def analyseFinanciereMensuelle(input_str: str) -> str:
    """Donne un aperçu financier pour le mois en cours basé sur les transactions et les récurrents.
    Input : user_id"""
    try:
        user_id = int(input_str)
        from datetime import date
        import calendar

        conn = get_db_connection()
        cursor = conn.cursor()

        today = date.today()
        first_day = today.replace(day=1)
        last_day = today.replace(day=calendar.monthrange(today.year, today.month)[1])
        jours_restants = (last_day - today).days

        ### 1. Calcul du solde actuel ###
        cursor.execute("""
            SELECT type, SUM(montant)
            FROM transactions
            WHERE user_id = %s AND date BETWEEN %s AND %s
            GROUP BY type
        """, (user_id, first_day, today))
        rows = cursor.fetchall()
        solde_actuel = 0.0
        for type_, montant in rows:
            montant = float(montant or 0)
            if type_ == "Revenu":
                solde_actuel += montant
            elif type_ == "Dépense":
                solde_actuel -= montant

        ### 2. Ajouter les récurrents à venir ###
        cursor.execute("""
            SELECT type, montant, date_prochaine
            FROM transactions_recurrentes
            WHERE user_id = %s AND frequence = 'mensuel'
        """, (user_id,))
        rows = cursor.fetchall()
        for type_, montant, date_prochaine in rows:
            montant = float(montant or 0)
            if today < date_prochaine <= last_day:
                if type_ == "Revenu":
                    solde_actuel += montant
                elif type_ == "Dépense":
                    solde_actuel -= montant

        solde_fin_mois = solde_actuel

        ### 3. Alerte financière ###
        moyenne_journaliere = solde_actuel / max(today.day, 1)
        prevision_mensuelle = moyenne_journaliere * calendar.monthrange(today.year, today.month)[1]
        seuil_alerte = 0.2 * prevision_mensuelle

        if solde_fin_mois < seuil_alerte:
            niveau_alerte = "🔴 Risque élevé"
        elif solde_fin_mois < 0.5 * prevision_mensuelle:
            niveau_alerte = "🟠 Situation modérée"
        else:
            niveau_alerte = "🟢 Situation stable"

        cursor.close()
        conn.close()

        return (
            f"📊 **Bilan financier du mois en cours** :\n"
            f"- Solde actuel : {solde_actuel:.2f} MAD\n"
            f"- Solde estimé en fin de mois : {solde_fin_mois:.2f} MAD\n"
            f"- Jours restants : {jours_restants} jours\n"
            f"- Niveau d'alerte : {niveau_alerte}"
        )

    except Exception as e:
        return f"Erreur dans analyseFinanciereMensuelle : {str(e)}"

@tool
def get_balance_prediction(user_id: int) -> str:
    """Prédit le solde sur 7 jours basé sur les transactions passées (Money Radar)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Get current balance (simplified: sum of all transactions)
        cursor.execute("SELECT SUM(CASE WHEN type='Revenu' THEN montant ELSE -montant END) as balance FROM transactions WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        current_balance = float(result['balance'] or 0)
        
        # 2. Calculate average daily spending over last 30 days
        thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        cursor.execute("SELECT SUM(montant) as total FROM transactions WHERE user_id = %s AND type = 'Dépense' AND date >= %s", (user_id, thirty_days_ago))
        spending_result = cursor.fetchone()
        total_spending = float(spending_result['total'] or 0)
        avg_daily_spending = total_spending / 30
        
        # 3. Detect upcoming recurring payments (simplified)
        # In a real app, this would be more complex
        
        predictions = []
        projected_balance = current_balance
        
        for i in range(8): # Today + 7 days
            date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
            if i > 0:
                projected_balance -= avg_daily_spending
            
            predictions.append({
                "day": "Aujourd'hui" if i == 0 else f"J+{i}",
                "date": date,
                "predicted": round(projected_balance, 2)
            })
            
        cursor.close()
        conn.close()
        
        return json.dumps({"current_balance": current_balance, "predictions": predictions})
        
    except Exception as e:
        return f"Erreur prédiction solde: {str(e)}"

@tool
def get_smart_actions(user_id: int) -> str:
    """Analyse les transactions et génère des recommandations (SmartActions)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Analyze Food spending
        this_week_start = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        cursor.execute("SELECT SUM(montant) as total FROM transactions WHERE user_id = %s AND type = 'Dépense' AND categorie = 'Alimentation' AND date >= %s", (user_id, this_week_start))
        food_spending = float(cursor.fetchone()['total'] or 0)
        
        actions = []
        
        # Rule 1: High Food Spending
        if food_spending > 500:
            actions.append({
                "type": "limit_spending",
                "title": "Limite tes dépenses Food",
                "description": f"Tu as dépensé {food_spending} MAD en nourriture cette semaine. Essaie de réduire pour le reste de la semaine.",
                "impact": "high",
                "savings": 100,
                "timeframe": "Cette semaine"
            })
            
        # Rule 2: Savings Opportunity
        # If balance > 1000, suggest saving
        cursor.execute("SELECT SUM(CASE WHEN type='Revenu' THEN montant ELSE -montant END) as balance FROM transactions WHERE user_id = %s", (user_id,))
        balance = float(cursor.fetchone()['balance'] or 0)
        
        if balance > 1000:
            savings_amount = int(balance * 0.1) # 10%
            actions.append({
                "type": "save_money",
                "title": "Déplace de l'argent en épargne",
                "description": f"Ton solde est confortable ({balance} MAD). Tu peux mettre {savings_amount} MAD de côté.",
                "impact": "medium",
                "savings": savings_amount,
                "timeframe": "Maintenant"
            })
            
        cursor.close()
        conn.close()
        
        if not actions:
            return json.dumps([]) # Return empty list if no actions
            
        return json.dumps(actions)
        
    except Exception as e:
        return f"Erreur smart actions: {str(e)}"

@tool 
def verifierDepassementBudget(input_str: str) -> str:
    """
    Vérifie pour chaque utilisateur si une catégorie dépasse son budget défini pour le mois en cours
    (dans la table `budgets`) et envoie un mail d'alerte.
    """
    conn = None
    cursor = None
    try:
        from agent.mail_send import envoyer_email_gmail
        from datetime import datetime
        from agent.langchain_agent import generate_smart_alert
        
        conn = get_db_connection()
        cursor = conn.cursor()

        today = datetime.today()
        current_month = today.strftime('%Y-%m')
        start_of_month = today.replace(day=1)
        start_next_month = today.replace(
            year=today.year + 1 if today.month == 12 else today.year,
            month=1 if today.month == 12 else today.month + 1,
            day=1
        )

        # Récupérer tous les budgets du mois
        cursor.execute("""
            SELECT user_id, category, amount
            FROM budgets
            WHERE month = %s
        """, (current_month,))
        budgets = cursor.fetchall()

        notifications = []

        for user_id, category, budget_amount in budgets:
            # Calcul des dépenses avec COALESCE pour éviter None
            cursor.execute("""
                SELECT COALESCE(SUM(montant), 0)
                FROM transactions
                WHERE user_id = %s
                AND type = 'Dépense'
                AND categorie = %s
                AND date >= %s AND date < %s
            """, (user_id, category, start_of_month, start_next_month))
            total_depense = cursor.fetchone()[0]  # Maintenant sécurisé avec COALESCE

            if total_depense > budget_amount:
                # Récupération sécurisée des infos utilisateur
                cursor.execute("SELECT email, nom FROM users WHERE id = %s", (user_id,))
                user_data = cursor.fetchone()
                
                if not user_data:  # Si l'utilisateur n'existe pas
                    continue
                    
                email = user_data[0] if user_data[0] else None
                nom = user_data[1] if len(user_data) > 1 and user_data[1] else "Utilisateur"
                
                if not email:  # Si pas d'email, on passe au suivant
                    continue
                
                alert_details = {
                    "user_id": user_id,
                    "user_name": nom,
                    "category": category,
                    "spent": total_depense,
                    "planned": budget_amount,
                    "month": current_month
                }
                
                try:
                    subject, message = generate_smart_alert(alert_details)
                    envoyer_email_gmail(email, subject, message)
                    notifications.append(f"Alerte envoyée à {email} (catégorie: {category})")
                except Exception as e:
                    notifications.append(f"Échec envoi à {email}: {str(e)}")

        return "Vérification terminée.\n" + "\n".join(notifications) if notifications else "Aucune alerte à envoyer."

    except Exception as e:
        return f"Erreur : {str(e)}"
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close() 
 @ t o o l  
 d e f   g e t _ s m a r t _ a l e r t s ( u s e r _ i d :   i n t )   - >   s t r :  
         " " " G � � n � � r e   d e s   a l e r t e s   i n t e l l i g e n t e s   b a s � � e s   s u r   l e s   d o n n � � e s   f i n a n c i � � r e s . " " "  
         t r y :  
                 c o n n   =   g e t _ d b _ c o n n e c t i o n ( )  
                 c u r s o r   =   c o n n . c u r s o r ( d i c t i o n a r y = T r u e )  
                  
                 a l e r t s   =   [ ]  
                  
                 #   1 .   B u d g e t   A l e r t s   ( C h e c k   b u d g e t s   v s   s p e n d i n g )  
                 c u r r e n t _ m o n t h   =   d a t e t i m e . n o w ( ) . s t r f t i m e ( ' % Y - % m ' )  
                 s t a r t _ o f _ m o n t h   =   d a t e t i m e . n o w ( ) . r e p l a c e ( d a y = 1 ) . s t r f t i m e ( ' % Y - % m - % d ' )  
                  
                 c u r s o r . e x e c u t e ( " S E L E C T   c a t e g o r y ,   a m o u n t   F R O M   b u d g e t s   W H E R E   u s e r _ i d   =   % s   A N D   m o n t h   =   % s " ,   ( u s e r _ i d ,   c u r r e n t _ m o n t h ) )  
                 b u d g e t s   =   c u r s o r . f e t c h a l l ( )  
                  
                 f o r   b u d g e t   i n   b u d g e t s :  
                         c a t e g o r y   =   b u d g e t [ ' c a t e g o r y ' ]  
                         l i m i t   =   f l o a t ( b u d g e t [ ' a m o u n t ' ] )  
                          
                         c u r s o r . e x e c u t e ( " S E L E C T   S U M ( m o n t a n t )   a s   t o t a l   F R O M   t r a n s a c t i o n s   W H E R E   u s e r _ i d   =   % s   A N D   t y p e   =   ' D � � p e n s e '   A N D   c a t e g o r i e   =   % s   A N D   d a t e   > =   % s " ,   ( u s e r _ i d ,   c a t e g o r y ,   s t a r t _ o f _ m o n t h ) )  
                         s p e n t _ r e s u l t   =   c u r s o r . f e t c h o n e ( )  
                         s p e n t   =   f l o a t ( s p e n t _ r e s u l t [ ' t o t a l ' ]   o r   0 )  
                          
                         i f   s p e n t   >   l i m i t :  
                                 a l e r t s . a p p e n d ( {  
                                         " i d " :   f " b u d g e t _ { c a t e g o r y } " ,  
                                         " t y p e " :   " d a n g e r " ,  
                                         " i c o n " :   " A l e r t T r i a n g l e " ,   #   F r o n t e n d   m a p s   s t r i n g   t o   c o m p o n e n t  
                                         " m e s s a g e " :   f " B u d g e t   { c a t e g o r y }   d � � p a s s � �   !   ( { s p e n t }   /   { l i m i t }   M A D ) " ,  
                                         " s e v e r i t y " :   " h i g h "  
                                 } )  
                         e l i f   s p e n t   >   l i m i t   *   0 . 8 :  
                                 a l e r t s . a p p e n d ( {  
                                         " i d " :   f " b u d g e t _ w a r n _ { c a t e g o r y } " ,  
                                         " t y p e " :   " w a r n i n g " ,  
                                         " i c o n " :   " T r e n d i n g D o w n " ,  
                                         " m e s s a g e " :   f " A t t e n t i o n ,   v o u s   � � t e s   � �   8 0 %   d u   b u d g e t   { c a t e g o r y } . " ,  
                                         " s e v e r i t y " :   " m e d i u m "  
                                 } )  
  
                 #   2 .   L a r g e   S p e n d i n g   A l e r t   ( L a s t   3   d a y s )  
                 t h r e e _ d a y s _ a g o   =   ( d a t e t i m e . n o w ( )   -   t i m e d e l t a ( d a y s = 3 ) ) . s t r f t i m e ( ' % Y - % m - % d ' )  
                 c u r s o r . e x e c u t e ( " S E L E C T   m o n t a n t ,   c a t e g o r i e   F R O M   t r a n s a c t i o n s   W H E R E   u s e r _ i d   =   % s   A N D   t y p e   =   ' D � � p e n s e '   A N D   d a t e   > =   % s   A N D   m o n t a n t   >   5 0 0   O R D E R   B Y   d a t e   D E S C   L I M I T   1 " ,   ( u s e r _ i d ,   t h r e e _ d a y s _ a g o ) )  
                 l a r g e _ t x n   =   c u r s o r . f e t c h o n e ( )  
                  
                 i f   l a r g e _ t x n :  
                           a l e r t s . a p p e n d ( {  
                                 " i d " :   " l a r g e _ s p e n d " ,  
                                 " t y p e " :   " i n f o " ,  
                                 " i c o n " :   " Z a p " ,  
                                 " m e s s a g e " :   f " G r o s s e   d � � p e n s e   r � � c e n t e   :   { l a r g e _ t x n [ ' m o n t a n t ' ] }   M A D   ( { l a r g e _ t x n [ ' c a t e g o r i e ' ] } ) " ,  
                                 " s e v e r i t y " :   " l o w "  
                         } )  
                          
                 c u r s o r . c l o s e ( )  
                 c o n n . c l o s e ( )  
                  
                 #   F a l l b a c k   i f   e m p t y  
                 i f   n o t   a l e r t s :  
                           a l e r t s . a p p e n d ( {  
                                 " i d " :   " d e f a u l t " ,  
                                 " t y p e " :   " s u c c e s s " ,  
                                 " i c o n " :   " S h i e l d " ,  
                                 " m e s s a g e " :   " T o u t   v a   b i e n   !   A u c u n e   a l e r t e   p o u r   l e   m o m e n t . " ,  
                                 " s e v e r i t y " :   " l o w "  
                         } )  
                          
                 r e t u r n   j s o n . d u m p s ( a l e r t s )  
  
         e x c e p t   E x c e p t i o n   a s   e :  
                 r e t u r n   f " E r r e u r   a l e r t e s :   { s t r ( e ) } "  
 