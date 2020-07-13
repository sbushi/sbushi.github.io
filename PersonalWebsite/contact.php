<?php
/* Set e-mail recipient */
$myemail = "stephenbushi@yahoo.com";

/* Check all form inputs using check_input function */
$name = check_input($_POST['name'], "Your Name");
$email = check_input($_POST['email'], "Your E-mail Address");
$subject = check_input($_POST['subject'], "Message Subject");
$message = check_input($_POST['message'], "Your Message");

/* If e-mail is not valid show error message */
if (!preg_match("/([\w\-]+\@[\w\-]+\.[\w\-]+)/", $email))
{
show_error("Invalid e-mail address");
}
/* Prepare the message for the e-mail */

$subject = "Personal Website Inquiry";

$message = "

Someone has sent you a message using your contact form:

Name: $name
Email: $email
Subject: $subject

Message:
$message

";

/* Send the message using mail() function */
mail($myemail, $subject, $message);

/* Redirect visitor to the thank you page */
header('Location: http://index.html/#five');
exit();

/* Functions we used */
function check_input($data, $problem='')
{
$data = trim($data);
$data = stripslashes($data);
$data = htmlspecialchars($data);
if ($problem && strlen($data) == 0)
{
show_error($problem);
}
return $data;
}

function show_error($myError)
{
?>
<html>
<body>

<p>Please correct the following error:</p>
<strong><?php echo $myError; ?></strong>
<p>Hit the back button and try again</p>

</body>
</html>
<?php
exit();
}
?>