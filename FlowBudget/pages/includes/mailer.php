<?php
class Mailer {
    private $api_key = 'key-xxxx'; // Obtenez-la sur Mailgun (gratuit pour 500 emails/mois)
    private $domain = 'sandboxxxx.mailgun.org';

    public function sendAlert($to, $subject, $message) {
        $url = "https://api.mailgun.net/v3/{$this->domain}/messages";
        
        $data = [
            'from' => "Smart Budget AI <postmaster@{$this->domain}>",
            'to' => $to,
            'subject' => $subject,
            'text' => $message
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $data,
            CURLOPT_USERPWD => "api:{$this->api_key}",
            CURLOPT_RETURNTRANSFER => true
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return strpos($response, 'Queued') !== false;
    }
}
?>