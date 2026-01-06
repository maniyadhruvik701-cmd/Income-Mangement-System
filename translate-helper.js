// Homepage Translation Updater
function updateHomepageTranslations() {
    // Update placeholders and text dynamically
    const lang = getCurrentLanguage();

    // Signup form
    document.querySelector('.sign-up-container h1').textContent = t('createAccount');
    document.querySelector('.sign-up-container span').textContent = t('orUseEmail');
    document.getElementById('signup-username')?.setAttribute('placeholder', t('username'));
    document.getElementById('signup-email')?.setAttribute('placeholder', t('email'));
    document.getElementById('signup-password')?.setAttribute('placeholder', t('password'));
    document.querySelector('.sign-up-container .btn-primary').textContent = t('signUpBtn');

    // Signin form  
    document.querySelector('.sign-in-container h1').textContent = t('signIn');
    document.querySelector('.sign-in-container span').textContent = t('orUseAccount');
    document.getElementById('login-identifier')?.setAttribute('placeholder', t('email'));
    document.getElementById('login-password')?.setAttribute('placeholder', t('password'));
    document.querySelector('.forgot-password').textContent = t('forgotPassword');
    const rememberMeLabel = document.querySelector('.remember-me label');
    if (rememberMeLabel) rememberMeLabel.textContent = t('rememberMe');
    document.querySelector('.sign-in-container .btn-primary').textContent = t('signInBtn');

    // Overlay panels
    document.querySelector('.overlay-left h1').textContent = t('welcomeBack');
    document.querySelector('.overlay-left p').textContent = t('welcomeBackMsg');
    document.querySelector('.overlay-left button').textContent = t('signInBtn');
    document.querySelector('.overlay-right h1').textContent = t('helloStranger');
    document.querySelector('.overlay-right p').textContent = t('signUpMsg');
    document.querySelector('.overlay-right button').textContent = t('signUpBtn');

    // Footer links
    const footerLinks = document.querySelectorAll('.footer-links a, .legal-footer a');
    if (footerLinks[0]) footerLinks[0].textContent = t('termsConditions');
    if (footerLinks[1]) footerLinks[1].textContent = t('privacyPolicy');
}

// Add this to the DOMContentLoaded event in script.js
