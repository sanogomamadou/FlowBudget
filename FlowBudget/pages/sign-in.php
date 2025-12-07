<?php
session_start();

// Connection to database
$host = 'localhost';
$dbname = 'budget_ai';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection error: " . $e->getMessage());
}

$error_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT id, mdp, nom FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['mdp'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['nom'];
        // Redirect to the new React Dashboard
        header("Location: /FlowBudget/frontend/dist/");
        exit;
    } else {
        $error_message = "Invalid email or password.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - FlowBudget</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        dark: '#09090B',
                        'dark-lighter': '#18181B',
                        primary: '#FF6B35', // CIH Orange
                        secondary: '#00A8CC', // CIH Blue
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        
        /* Fix for Chrome/Safari autofill background color */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #09090B inset !important;
            -webkit-text-fill-color: white !important;
            caret-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }
    </style>
</head>
<body class="bg-dark min-h-screen flex items-center justify-center p-4 relative">
    <!-- Background Gradients -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]"></div>
    </div>

    <div class="max-w-md w-full bg-dark-lighter/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        <div class="p-6">
            <div class="text-center mb-6">
                <div class="flex justify-center mb-4">
                    <img src="/FlowBudget/logo.png" alt="FlowBudget Logo" class="w-16 h-16 rounded-2xl shadow-[0_0_20px_rgba(0,168,204,0.4)]">
                </div>
                <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter mb-2">FlowBudget</h1>
                <p class="text-gray-400 font-medium">Welcome back to your financial dashboard</p>
            </div>

            <?php if ($error_message): ?>
                <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                    <?php echo htmlspecialchars($error_message); ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="" class="space-y-5">
                <div>
                    <label for="email" class="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                    <input type="email" id="email" name="email" required 
                        class="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-gray-600"
                        placeholder="you@example.com">
                </div>

                <div>
                    <label for="password" class="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Password</label>
                    <input type="password" id="password" name="password" required 
                        class="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-gray-600"
                        placeholder="••••••••">
                </div>

                <button type="submit" 
                    class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(0,168,204,0.4)] hover:scale-[1.02] active:scale-95">
                    Sign In
                </button>
            </form>

            <div class="mt-8 text-center">
                <p class="text-sm text-gray-400">
                    Don't have an account? 
                    <a href="sign-up.php" class="text-primary hover:text-white font-bold transition-colors">Sign up</a>
                </p>
            </div>
        </div>
        <div class="bg-white/5 px-8 py-4 border-t border-white/5 text-center">
            <p class="text-xs text-gray-500">&copy; <?php echo date('Y'); ?> FlowBudget. All rights reserved.</p>
        </div>
    </div>
</body>
</html>