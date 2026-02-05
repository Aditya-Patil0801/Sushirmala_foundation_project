import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    // Home
    'home.title': 'Empowering Women Through Community Savings',
    'home.subtitle': 'Join our self-help groups and build financial security together',
    'home.getStarted': 'Get Started',
    'home.learnMore': 'Learn More',
    'home.features': 'Features',
    'home.feature1': 'Digital Financial Management',
    'home.feature1.desc': 'Track savings, loans, and contributions digitally',
    'home.feature2': 'Community Support',
    'home.feature2.desc': 'Connect with other women in your community',
    'home.feature3': 'Transparent Records',
    'home.feature3.desc': 'Maintain clear and accessible financial records',
    'home.howItWorks': 'How It Works',
    'home.step1': 'Join a Group',
    'home.step1.desc': 'Find and join a Bachat Gat in your area',
    'home.step2': 'Start Saving',
    'home.step2.desc': 'Begin contributing to group savings',
    'home.step3': 'Access Loans',
    'home.step3.desc': 'Apply for low-interest loans when needed',
    'home.testimonial': 'This platform has transformed how our group manages finances. It\'s so easy to track contributions and loans!',
    'home.testimonial.author': '- Sunita, Group President',
    
    // Navbar
    'navbar.home': 'Home',
    'navbar.about': 'About',
    'navbar.schemes': 'Schemes',
    'navbar.contact': 'Contact',
    'navbar.login': 'Login',
    'navbar.logout': 'Logout',
    'navbar.dashboard': 'Dashboard',
    'navbar.admin': 'Admin Panel',
    'navbar.profile': 'Profile',
    'navbar.language': 'Language',
    'navbar.welcome': 'Welcome',
    'navbar.register': 'Register',
    
    // Home page additional keys
    'home.join': 'Join',
    'home.signin': 'Sign In',
    'home.enquire': 'Enquire Now',
    'home.description': 'Join our self-help groups and build financial security together',
    'home.stats.members': 'Members',
    'home.stats.savings': 'Total Savings',
    'home.stats.groups': 'Groups',
    
    // Gats section
    'gats.title': 'Our Bachat Gats',
    'gats.desc': 'Explore the women\'s self-help groups in our network',
    'gats.view': 'View All Groups',
    'gats.enquire': 'Enquire to Join',
    
    // Features section
    'features.community': 'Community Support',
    'features.community.desc': 'Connect with other women in your community',
    'features.investment': 'Smart Investments',
    'features.investment.desc': 'Access low-interest loans for personal and business needs',
    'features.secure': 'Secure Records',
    'features.secure.desc': 'Maintain transparent and secure financial records',
    'features.empowerment': 'Women Empowerment',
    'features.empowerment.desc': 'Build financial literacy and leadership skills',
    
    // Benefits section
    'benefits.title': 'Why Join Our Community?',
    'benefits.desc': 'Being part of our Bachat Gats provides numerous benefits for women\'s financial empowerment',
    'benefits.zeroFees': 'Zero membership fees',
    'benefits.flexible': 'Flexible contribution amounts',
    'benefits.emergency': 'Emergency loan facility',
    'benefits.literacy': 'Financial literacy programs',
    'benefits.government': 'Access to government schemes',
    'benefits.community': 'Strong community support',
    
    // Dashboard section
    'dashboard.join': 'Join Our Community',
    'dashboard.join.desc': 'Start your journey towards financial independence',
    'dashboard.community': 'Join a community group',
    'dashboard.savings': 'Start saving regularly',
    'dashboard.skill': 'Develop financial skills',
    
    // Footer
    'footer.about': 'About Us',
    'footer.about.desc': 'Sushrimala Mahila Bachat Gat is dedicated to empowering women through community-based financial services.',
    'footer.quicklinks': 'Quick Links',
    'footer.enquiry': 'Membership Enquiry',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.copyright': '© 2025 Sushrimala Mahila Bachat Gat. All rights reserved.',
    'footer.address': 'Address',
    'footer.contact': 'Contact Us',
    'footer.email': 'Email',
    'footer.phone': 'Phone',
    
    // Enquiry
    'enquiry.title': 'Join Our Community',
    'enquiry.desc': 'Fill out our simple enquiry form and our team will get back to you with next steps to join our Bachat Gats.',
    'enquiry.submit': 'Submit Enquiry Form',
    'enquiry.step1': 'Fill Enquiry Form',
    'enquiry.step1.desc': 'Share your details and interest in joining our community',
    'enquiry.step2': 'Get Approval',
    'enquiry.step2.desc': 'Our officers will review your application and contact you',
    'enquiry.step3': 'Join Community',
    'enquiry.step3.desc': 'Start your savings journey with other women in your community',
    
    // Login
    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to your account',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.bachatGat': 'Bachat Gat Group',
    'login.selectBachatGat': 'Select your Bachat Gat group',
    'login.role': 'Role',
    'login.selectRole': 'Select your role',
    'login.button': 'Sign In',
    'login.forgot': 'Forgot Password?',
    'login.noaccount': 'Don\'t have an account?',
    'login.register': 'Register here',
    
    // Forgot Password
    'forgot.title': 'Forgot Password?',
    'forgot.subtitle': 'Enter your email address and we\'ll send you a link to reset your password.',
    'forgot.button': 'Send Reset Link',
    'forgot.back': 'Back to Login',
    'forgot.checkEmail': 'Check Your Email',
    'forgot.emailSent': 'We\'ve sent password reset instructions to',
    'forgot.instructions': 'Please check your email and follow the instructions to reset your password.',
    'forgot.noEmail': 'Didn\'t receive the email? Check your spam folder.',
    'forgot.resend': 'Resend Email',
    
    // Reset Password
    'reset.title': 'Reset Password',
    'reset.subtitle': 'Enter your new password below',
    'reset.newPassword': 'New Password',
    'reset.confirmPassword': 'Confirm New Password',
    'reset.button': 'Reset Password',
    'reset.back': 'Back to Login',
    'reset.success': 'Password Reset Successful',
    'reset.successMessage': 'Your password has been successfully reset.',
    'reset.login': 'Go to Login',
    'reset.invalid': 'Invalid Reset Link',
    'reset.invalidMessage': 'The password reset link is invalid or has expired.',
    'reset.requestNew': 'Request New Reset Link',
    
    // Register
    'register.title': 'Join Our Community',
    'register.subtitle': 'Create your account to start your savings journey',
    'register.name': 'Full Name',
    'register.email': 'Email Address',
    'register.password': 'Password',
    'register.phone': 'Phone Number',
    'register.village': 'Village',
    'register.district': 'District',
    'register.state': 'State',
    'register.pincode': 'Pincode',
    'register.age': 'Age',
    'register.occupation': 'Occupation',
    'register.income': 'Monthly Income (₹)',
    'register.aadhar': 'Aadhar Number',
    'register.bachatGat': 'Bachat Gat Group',
    'register.selectBachatGat': 'Select a Bachat Gat group (optional)',
    'register.role': 'Role',
    'register.selectRole': 'Select your role',
    'register.member': 'Member',
    'register.president': 'President',
    'register.secretary': 'Secretary',
    'register.treasurer': 'Treasurer',
    'register.button': 'Create Account',
    'register.haveaccount': 'Already have an account?',
    'register.login': 'Login here',
    'register.terms': 'I agree to the Terms of Service and Privacy Policy',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    'dashboard.contributions': 'Contributions',
    'dashboard.loans': 'Loans',
    'dashboard.schemes': 'Schemes',
    'dashboard.notices': 'Notices',
    'dashboard.viewAll': 'View All',
    'dashboard.noNotices': 'No notices at this time',
    'dashboard.contribution.title': 'Monthly Contribution',
    'dashboard.contribution.amount': 'Amount',
    'dashboard.contribution.status': 'Status',
    'dashboard.contribution.paid': 'Paid',
    'dashboard.contribution.pending': 'Pending',
    'dashboard.loan.title': 'Current Loan',
    'dashboard.loan.amount': 'Amount',
    'dashboard.loan.balance': 'Balance',
    'dashboard.loan.interest': 'Interest Rate',
    'dashboard.loan.status': 'Status',
    'dashboard.actions': 'Quick Actions',
    'dashboard.actions.contribute': 'Record Contribution',
    'dashboard.actions.loan': 'Apply for Loan',
    'dashboard.actions.profile': 'Update Profile',
    'dashboard.actions.enquiry': 'View Enquiries',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.back': 'Back',
  },
  hi: {
    // Home
    'home.title': 'समुदाय बचत के माध्यम से महिलाओं को सशक्त बनाना',
    'home.subtitle': 'हमारे आत्म-सहायता समूहों में शामिल हों और साथ में वित्तीय सुरक्षा बनाएं',
    'home.getStarted': 'शुरू करें',
    'home.learnMore': 'और जानें',
    'home.features': 'विशेषताएँ',
    'home.feature1': 'डिजिटल वित्तीय प्रबंधन',
    'home.feature1.desc': 'डिजिटल रूप से बचत, ऋण और योगदान को ट्रैक करें',
    'home.feature2': 'सामुदायिक समर्थन',
    'home.feature2.desc': 'अपने समुदाय की अन्य महिलाओं से जुड़ें',
    'home.feature3': 'पारदर्शी रिकॉर्ड',
    'home.feature3.desc': 'स्पष्ट और सुलभ वित्तीय रिकॉर्ड बनाए रखें',
    'home.howItWorks': 'यह कैसे काम करता है',
    'home.step1': 'एक समूह में शामिल हों',
    'home.step1.desc': 'अपने क्षेत्र में एक बचत गृह समूह खोजें और शामिल हों',
    'home.step2': 'बचत शुरू करें',
    'home.step2.desc': 'समूह बचत में योगदान देना शुरू करें',
    'home.step3': 'ऋण प्राप्त करें',
    'home.step3.desc': 'आवश्यकता पड़ने पर कम ब्याज दर वाले ऋण के लिए आवेदन करें',
    'home.testimonial': 'यह प्लेटफॉर्म ने हमारे समूह के वित्त प्रबंधन को बदल दिया है। योगदान और ऋण को ट्रैक करना बहुत आसान है!',
    'home.testimonial.author': '- सुनीता, समूह अध्यक्ष',
    
    // Navbar
    'navbar.home': 'होम',
    'navbar.about': 'हमारे बारे में',
    'navbar.schemes': 'योजनाएँ',
    'navbar.contact': 'संपर्क करें',
    'navbar.login': 'लॉग इन करें',
    'navbar.logout': 'लॉग आउट',
    'navbar.dashboard': 'डैशबोर्ड',
    'navbar.admin': 'व्यवस्थापक पैनल',
    'navbar.profile': 'प्रोफ़ाइल',
    'navbar.language': 'भाषा',
    'navbar.welcome': 'स्वागत है',
    'navbar.register': 'रजिस्टर',
    
    // Home page additional keys
    'home.join': 'शामिल हों',
    'home.signin': 'साइन इन करें',
    'home.enquire': 'अभी पूछताछ करें',
    'home.description': 'हमारे आत्म-सहायता समूहों में शामिल हों और साथ में वित्तीय सुरक्षा बनाएं',
    'home.stats.members': 'सदस्य',
    'home.stats.savings': 'कुल बचत',
    'home.stats.groups': 'समूह',
    
    // Gats section
    'gats.title': 'हमारे बचत गृह',
    'gats.desc': 'हमारे नेटवर्क में महिलाओं के आत्म-सहायता समूहों की खोज करें',
    'gats.view': 'सभी समूह देखें',
    'gats.enquire': 'शामिल होने के लिए पूछताछ करें',
    
    // Features section
    'features.community': 'सामुदायिक समर्थन',
    'features.community.desc': 'अपने समुदाय की अन्य महिलाओं से जुड़ें',
    'features.investment': 'चालाक निवेश',
    'features.investment.desc': 'व्यक्तिगत और व्यापारी आवश्यकताओं के लिए कम ब्याज दर वाले ऋण प्राप्त करें',
    'features.secure': 'सुरक्षित रिकॉर्ड',
    'features.secure.desc': 'पारदर्शी और सुरक्षित वित्तीय रिकॉर्ड बनाए रखें',
    'features.empowerment': 'महिलाओं की सशक्तिकरण',
    'features.empowerment.desc': 'वित्तीय ज्ञान और नेतृत्व कौशल बनाएं',
    
    // Benefits section
    'benefits.title': 'हमारे समुदाय में शामिल होने क्यों?',
    'benefits.desc': 'हमारे बचत गृहों में हिस्सा लेने से महिलाओं के वित्तीय सशक्तिकरण के लिए कई लाभ प्राप्त होते हैं',
    'benefits.zeroFees': 'शून्य सदस्यता शुल्क',
    'benefits.flexible': 'नियमित योगदान राशि',
    'benefits.emergency': 'आपातकालिक ऋण सुविधा',
    'benefits.literacy': 'वित्तीय ज्ञान कार्यक्रम',
    'benefits.government': 'राज्य सरकारी योजनाओं का पहुंच',
    'benefits.community': 'मजबूत सामुदायिक समर्थन',
    
    // Dashboard section
    'dashboard.join': 'हमारे समुदाय में शामिल हों',
    'dashboard.join.desc': 'वित्तीय स्वातंत्र्य की यात्रा शुरू करें',
    'dashboard.community': 'एक सामुदायिक समूह में शामिल हों',
    'dashboard.savings': 'नियमित बचत शुरू करें',
    'dashboard.skill': 'वित्तीय कौशल विकास करें',
    
    // Footer
    'footer.about': 'हमारे बारे में',
    'footer.about.desc': 'सुश्रीमाला महिला बचत गृह समूह महिलाओं को सामुदायिक आधार पर वित्तीय सेवाओं के माध्यम से सशक्त बनाने के लिए समर्पित है।',
    'footer.quicklinks': 'त्वरित लिंक',
    'footer.enquiry': 'सदस्यता पूछताछ',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.terms': 'सेवा की शर्तें',
    'footer.copyright': '© 2025 सुश्रीमाला महिला बचत गृह समूह। सर्वाधिकार सुरक्षित।',
    'footer.address': 'पता',
    'footer.contact': 'संपर्क करें',
    'footer.email': 'ईमेल',
    'footer.phone': 'फ़ोन',
    
    // Enquiry
    'enquiry.title': 'हमारे समुदाय में शामिल हों',
    'enquiry.desc': 'हमारा सरल पूछताछ फॉर्म भरें और हमारी टीम आपके बचत गृह समूह में शामिल होने के लिए अगले चरणों के साथ आपको संपर्क करेगी।',
    'enquiry.submit': 'पूछताछ फॉर्म जमा करें',
    'enquiry.step1': 'पूछताछ फॉर्म भरें',
    'enquiry.step1.desc': 'अपना विवरण साझा करें और हमारे समुदाय में शामिल होने में रुचि दिखाएं',
    'enquiry.step2': 'अनुमोदन प्राप्त करें',
    'enquiry.step2.desc': 'हमारे अधिकारी आपका आवेदन समीक्षा करेंगे और आपसे संपर्क करेंगे',
    'enquiry.step3': 'समुदाय में शामिल हों',
    'enquiry.step3.desc': 'अपने समुदाय की अन्य महिलाओं के साथ अपनी बचत यात्रा शुरू करें',
    
    // Login
    'login.title': 'वापसी पर स्वागत है',
    'login.subtitle': 'अपने खाते में साइन इन करें',
    'login.email': 'ईमेल पता',
    'login.password': 'पासवर्ड',
    'login.bachatGat': 'बचत गृह समूह',
    'login.selectBachatGat': 'अपना बचत गृह समूह चुनें',
    'login.role': 'भूमिका',
    'login.selectRole': 'अपनी भूमिका चुनें',
    'login.button': 'साइन इन करें',
    'login.forgot': 'पासवर्ड भूल गए?',
    'login.noaccount': 'खाता नहीं है?',
    'login.register': 'यहाँ पंजीकरण करें',
    
    // Forgot Password
    'forgot.title': 'पासवर्ड भूल गए?',
    'forgot.subtitle': 'अपना ईमेल पता दर्ज करें और हम आपको पासवर्ड रीसेट करने के लिए एक लिंक भेजेंगे।',
    'forgot.button': 'रीसेट लिंक भेजें',
    'forgot.back': 'लॉगिन पर वापस जाएं',
    'forgot.checkEmail': 'अपना ईमेल चेक करें',
    'forgot.emailSent': 'हमने पासवर्ड रीसेट निर्देश भेजे हैं',
    'forgot.instructions': 'कृपया अपना ईमेल चेक करें और पासवर्ड रीसेट करने के लिए निर्देशों का पालन करें।',
    'forgot.noEmail': 'ईमेल प्राप्त नहीं हुआ? अपना स्पैम फ़ोल्डर चेक करें।',
    'forgot.resend': 'ईमेल पुनः भेजें',
    
    // Reset Password
    'reset.title': 'पासवर्ड रीसेट करें',
    'reset.subtitle': 'नीचे अपना नया पासवर्ड दर्ज करें',
    'reset.newPassword': 'नया पासवर्ड',
    'reset.confirmPassword': 'नए पासवर्ड की पुष्टि करें',
    'reset.button': 'पासवर्ड रीसेट करें',
    'reset.back': 'लॉगिन पर वापस जाएं',
    'reset.success': 'पासवर्ड रीसेट सफल',
    'reset.successMessage': 'आपका पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है।',
    'reset.login': 'लॉगिन पर जाएं',
    'reset.invalid': 'अमान्य रीसेट लिंक',
    'reset.invalidMessage': 'पासवर्ड रीसेट लिंक अमान्य है या समाप्त हो गया है।',
    'reset.requestNew': 'नया रीसेट लिंक का अनुरोध करें',
    
    // Register
    'register.title': 'हमारे समुदाय में शामिल हों',
    'register.subtitle': 'अपना खाता बनाएं और अपनी बचत यात्रा शुरू करें',
    'register.name': 'पूरा नाम',
    'register.email': 'ईमेल पता',
    'register.password': 'पासवर्ड',
    'register.phone': 'फ़ोन नंबर',
    'register.village': 'गाँव',
    'register.district': 'जिला',
    'register.state': 'राज्य',
    'register.pincode': 'पिनकोड',
    'register.age': 'आयु',
    'register.occupation': 'व्यवसाय',
    'register.income': 'मासिक आय (₹)',
    'register.aadhar': 'आधार नंबर',
    'register.bachatGat': 'बचत गृह समूह',
    'register.selectBachatGat': 'एक बचत गृह समूह चुनें (वैकल्पिक)',
    'register.role': 'भूमिका',
    'register.selectRole': 'अपनी भूमिका चुनें',
    'register.member': 'सदस्य',
    'register.president': 'अध्यक्ष',
    'register.secretary': 'सचिव',
    'register.treasurer': 'कोषाध्यक्ष',
    'register.button': 'खाता बनाएं',
    'register.haveaccount': 'पहले से खाता है?',
    'register.login': 'यहाँ लॉगिन करें',
    'register.terms': 'मैं सेवा की शर्तों और गोपनीयता नीति से सहमत हूँ',
    
    // Dashboard
    'dashboard.welcome': 'स्वागत है',
    'dashboard.overview': 'अवलोकन',
    'dashboard.contributions': 'योगदान',
    'dashboard.loans': 'ऋण',
    'dashboard.schemes': 'योजनाएँ',
    'dashboard.notices': 'सूचनाएँ',
    'dashboard.viewAll': 'सभी देखें',
    'dashboard.noNotices': 'इस समय कोई सूचना नहीं है',
    'dashboard.contribution.title': 'मासिक योगदान',
    'dashboard.contribution.amount': 'राशि',
    'dashboard.contribution.status': 'स्थिति',
    'dashboard.contribution.paid': 'भुगतान किया गया',
    'dashboard.contribution.pending': 'लंबित',
    'dashboard.loan.title': 'वर्तमान ऋण',
    'dashboard.loan.amount': 'राशि',
    'dashboard.loan.balance': 'शेष राशि',
    'dashboard.loan.interest': 'ब्याज दर',
    'dashboard.loan.status': 'स्थिति',
    'dashboard.actions': 'त्वरित कार्य',
    'dashboard.actions.contribute': 'योगदान दर्ज करें',
    'dashboard.actions.loan': 'ऋण के लिए आवेदन करें',
    'dashboard.actions.profile': 'प्रोफ़ाइल अपडेट करें',
    'dashboard.actions.enquiry': 'पूछताछ देखें',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'एक त्रुटि हुई',
    'common.success': 'सफलता',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.close': 'बंद करें',
    'common.submit': 'जमा करें',
    'common.back': 'वापस',
  },
  mr: {
    // Home
    'home.title': 'समुदाय बचतेमध्ये महिलांना सक्षम करणे',
    'home.subtitle': 'आमच्या स्व-मदत समूहांमध्ये सामील व्हा आणि एकत्रितपणे आर्थिक सुरक्षितता तयार करा',
    'home.getStarted': 'सुरू करा',
    'home.learnMore': 'अधिक जाणून घ्या',
    'home.features': 'वैशिष्ट्ये',
    'home.feature1': 'डिजिटल आर्थिक व्यवस्थापन',
    'home.feature1.desc': 'डिजिटल पातळीवर बचत, कर्ज आणि योगदान ट्रॅक करा',
    'home.feature2': 'समुदाय समर्थन',
    'home.feature2.desc': 'तुमच्या समुदायातील इतर महिलांशी कनेक्ट करा',
    'home.feature3': 'पारदर्शक नोंदी',
    'home.feature3.desc': 'स्पष्ट आणि प्रवेशयोग्य आर्थिक नोंदी करा',
    'home.howItWorks': 'हे कसे काम करते',
    'home.step1': 'एका गटात सामील व्हा',
    'home.step1.desc': 'तुमच्या क्षेत्रातील बचत गट शोधा आणि सामील व्हा',
    'home.step2': 'बचत सुरू करा',
    'home.step2.desc': 'गट बचतमध्ये योगदान देणे सुरू करा',
    'home.step3': 'कर्ज मिळवा',
    'home.step3.desc': 'आवश्यकता असल्यास कमी व्याजाच्या कर्जासाठी अर्ज करा',
    'home.testimonial': 'हे प्लॅटफॉर्म आमच्या गटाचे वित्त व्यवस्थापन बदलून टाकले आहे. योगदान आणि कर्ज ट्रॅक करणे खूपच सोपे आहे!',
    'home.testimonial.author': '- सुनीता, गटाच्या अध्यक्ष',
    
    // Navbar
    'navbar.home': 'होम',
    'navbar.about': 'आमच्याबद्दल',
    'navbar.schemes': 'योजना',
    'navbar.contact': 'संपर्क साधा',
    'navbar.login': 'लॉग इन करा',
    'navbar.logout': 'लॉग आउट',
    'navbar.dashboard': 'डॅशबोर्ड',
    'navbar.admin': 'प्रशासक पॅनेल',
    'navbar.profile': 'प्रोफाइल',
    'navbar.language': 'भाषा',
    'navbar.welcome': 'स्वागत आहे',
    'navbar.register': 'रजिस्टर',
    
    // Home page additional keys
    'home.join': 'सामील व्हा',
    'home.signin': 'साइन इन करा',
    'home.enquire': 'अभी पूछताछ करा',
    'home.description': 'आमच्या स्व-मदत समूहांमध्ये सामील व्हा आणि एकत्रितपणे आर्थिक सुरक्षितता तयार करा',
    'home.stats.members': 'सदस्य',
    'home.stats.savings': 'कुल बचत',
    'home.stats.groups': 'समूह',
    
    // Gats section
    'gats.title': 'हमारे बचत गट',
    'gats.desc': 'हमारे नेटवर्क में महिलाओं के आत्म-सहायता समूहों की खोज करें',
    'gats.view': 'सभी समूह देखें',
    'gats.enquire': 'शामिल होने के लिए पूछताछ करें',
    
    // Features section
    'features.community': 'सामुदायिक समर्थन',
    'features.community.desc': 'तुमच्या समुदायातील इतर महिलांशी कनेक्ट करा',
    'features.investment': 'चालाक निवेश',
    'features.investment.desc': 'व्यक्तिगत और व्यापारी आवश्यकताओं के लिए कम व्याजाच्या कर्जासाठी अर्ज करा',
    'features.secure': 'सुरक्षित नोंदी',
    'features.secure.desc': 'पारदर्शी आणि सुरक्षित आर्थिक नोंदी करा',
    'features.empowerment': 'महिलाओं की सशक्तिकरण',
    'features.empowerment.desc': 'वित्तीय ज्ञान आणि नेतृत्व कौशल बनाएं',
    
    // Benefits section
    'benefits.title': 'हमारे समुदाय में शामिल होने क्यों?',
    'benefits.desc': 'हमारे बचत गटात सामील होण्यासाठी महिलाओं के वित्तीय सशक्तिकरण के लिए कई लाभ प्राप्त होते हैं',
    'benefits.zeroFees': 'शून्य सदस्यता शुल्क',
    'benefits.flexible': 'नियमित योगदान राशि',
    'benefits.emergency': 'आपातकालिक ऋण सुविधा',
    'benefits.literacy': 'वित्तीय ज्ञान कार्यक्रम',
    'benefits.government': 'राज्य सरकारी योजनाओं का पहुंच',
    'benefits.community': 'मजबूत सामुदायिक समर्थन',
    
    // Dashboard section
    'dashboard.join': 'हमारे समुदाय में शामिल हों',
    'dashboard.join.desc': 'वित्तीय स्वातंत्र्य की यात्रा शुरू करें',
    'dashboard.community': 'एक सामुदायिक समूह में शामिल हों',
    'dashboard.savings': 'नियमित बचत शुरू करें',
    'dashboard.skill': 'वित्तीय कौशल विकास करें',
    
    // Footer
    'footer.about': 'आमच्याबद्दल',
    'footer.about.desc': 'सुश्रीमाला महिला बचत गट हा समुदाय-आधारित आर्थिक सेवांद्वारे महिलांना सक्षम करण्यासाठी समर्पित आहे.',
    'footer.quicklinks': 'जलद दुवे',
    'footer.enquiry': 'सदस्यत्व चौकशी',
    'footer.privacy': 'गोपनीयता धोरण',
    'footer.terms': 'सेवेच्या अटी',
    'footer.copyright': '© 2025 सुश्रीमाला महिला बचत गट. सर्व हक्क राखीव.',
    'footer.address': 'पत्ता',
    'footer.contact': 'आमच्याशी संपर्क साधा',
    'footer.email': 'ईमेल',
    'footer.phone': 'फोन',
    
    // Enquiry
    'enquiry.title': 'आमच्या समुदायात सामील व्हा',
    'enquiry.desc': 'आमचा सोपा चौकशी फॉर्म भरा आणि आमची संघटना तुमच्याशी संपर्क साधून बचत गटात सामील होण्यासाठी पुढील पायरी माहित करून देईल.',
    'enquiry.submit': 'चौकशी फॉर्म सादर करा',
    'enquiry.step1': 'चौकशी फॉर्म भरा',
    'enquiry.step1.desc': 'तुमची माहिती सामायिक करा आणि आमच्या समुदायात सामील होण्याची रुची दाखवा',
    'enquiry.step2': 'मंजूरी मिळवा',
    'enquiry.step2.desc': 'आमचे अधिकारी तुमचा अर्ज पाहतील आणि तुमच्याशी संपर्क साधतील',
    'enquiry.step3': 'समुदायात सामील व्हा',
    'enquiry.step3.desc': 'तुमच्या समुदायातील इतर महिलांबरोबर तुमची बचत यात्रा सुरू करा',
    
    // Login
    'login.title': 'परत येण्याबद्दल स्वागत आहे',
    'login.subtitle': 'तुमच्या खात्यात साइन इन करा',
    'login.email': 'ईमेल पत्ता',
    'login.password': 'पासवर्ड',
    'login.bachatGat': 'बचत गट',
    'login.selectBachatGat': 'तुमचा बचत गट निवडा',
    'login.role': 'भूमिका',
    'login.selectRole': 'तुमची भूमिका निवडा',
    'login.button': 'साइन इन करा',
    'login.forgot': 'पासवर्ड विसरलात?',
    'login.noaccount': 'खाते नाही?',
    'login.register': 'येथे नोंदणी करा',
    
    // Forgot Password
    'forgot.title': 'पासवर्ड विसरलात?',
    'forgot.subtitle': 'तुमचा ईमेल पत्ता प्रविष्ट करा आणि आम्ही तुम्हाला पासवर्ड रीसेट करण्यासाठी एक दुवा पाठवू.',
    'forgot.button': 'रीसेट दुवा पाठवा',
    'forgot.back': 'लॉगिन वर परत जा',
    'forgot.checkEmail': 'तुमचा ईमेल तपासा',
    'forgot.emailSent': 'आम्ही पासवर्ड रीसेट सूचना पाठवल्या आहेत',
    'forgot.instructions': 'कृपया तुमचा ईमेल तपासा आणि पासवर्ड रीसेट करण्यासाठी सूचनांचे अनुसरण करा.',
    'forgot.noEmail': 'ईमेल मिळाला नाही? तुमचा स्पॅम फोल्डर तपासा.',
    'forgot.resend': 'ईमेल पुन्हा पाठवा',
    
    // Reset Password
    'reset.title': 'पासवर्ड रीसेट करा',
    'reset.subtitle': 'खाली तुमचा नवीन पासवर्ड प्रविष्ट करा',
    'reset.newPassword': 'नवीन पासवर्ड',
    'reset.confirmPassword': 'नवीन पासवर्डची पुष्टी करा',
    'reset.button': 'पासवर्ड रीसेट करा',
    'reset.back': 'लॉगिन वर परत जा',
    'reset.success': 'पासवर्ड रीसेट यशस्वी',
    'reset.successMessage': 'तुमचा पासवर्ड यशस्वीपणे रीसेट केला गेला आहे.',
    'reset.login': 'लॉगिन वर जा',
    'reset.invalid': 'अवैध रीसेट दुवा',
    'reset.invalidMessage': 'पासवर्ड रीसेट दुवा अवैध आहे किंवा कालबाह्य झाला आहे.',
    'reset.requestNew': 'नवीन रीसेट दुव्याची विनंती करा',
    
    // Register
    'register.title': 'आमच्या समुदायात सामील व्हा',
    'register.subtitle': 'तुमचे खाते तयार करा आणि तुमची बचत यात्रा सुरू करा',
    'register.name': 'पूर्ण नाव',
    'register.email': 'ईमेल पत्ता',
    'register.password': 'पासवर्ड',
    'register.phone': 'फोन नंबर',
    'register.village': 'गाव',
    'register.district': 'जिल्हा',
    'register.state': 'राज्य',
    'register.pincode': 'पिनकोड',
    'register.age': 'वय',
    'register.occupation': 'व्यवसाय',
    'register.income': 'मासिक उत्पन्न (₹)',
    'register.aadhar': 'आधार क्रमांक',
    'register.bachatGat': 'बचत गट',
    'register.selectBachatGat': 'एक बचत गट निवडा (पर्यायी)',
    'register.role': 'भूमिका',
    'register.selectRole': 'तुमची भूमिका निवडा',
    'register.member': 'सदस्य',
    'register.president': 'अध्यक्ष',
    'register.secretary': 'सचिव',
    'register.treasurer': 'कोषाध्यक्ष',
    'register.button': 'खाते तयार करा',
    'register.haveaccount': 'आधीपासूनच खाते आहे?',
    'register.login': 'येथे लॉगिन करा',
    'register.terms': 'मी सेवेच्या अटी आणि गोपनीयता धोरणाशी सहमत आहे',
    
    // Dashboard
    'dashboard.welcome': 'स्वागत आहे',
    'dashboard.overview': 'अवलोकन',
    'dashboard.contributions': 'योगदान',
    'dashboard.loans': 'कर्ज',
    'dashboard.schemes': 'योजना',
    'dashboard.notices': 'सूचना',
    'dashboard.viewAll': 'सर्व पहा',
    'dashboard.noNotices': 'यावेळी कोणत्याही सूचना नाहीत',
    'dashboard.contribution.title': 'मासिक योगदान',
    'dashboard.contribution.amount': 'रक्कम',
    'dashboard.contribution.status': 'स्थिती',
    'dashboard.contribution.paid': 'भरले',
    'dashboard.contribution.pending': 'प्रलंबित',
    'dashboard.loan.title': 'सद्य कर्ज',
    'dashboard.loan.amount': 'रक्कम',
    'dashboard.loan.balance': 'शिल्लक',
    'dashboard.loan.interest': 'व्याज दर',
    'dashboard.loan.status': 'स्थिती',
    'dashboard.actions': 'जलद कृती',
    'dashboard.actions.contribute': 'योगदान नोंदवा',
    'dashboard.actions.loan': 'कर्जासाठी अर्ज करा',
    'dashboard.actions.profile': 'प्रोफाइल अपडेट करा',
    'dashboard.actions.enquiry': 'चौकशी पहा',
    
    // Common
    'common.loading': 'लोड होत आहे...',
    'common.error': 'एक त्रुटी आली',
    'common.success': 'यश',
    'common.save': 'जतन करा',
    'common.cancel': 'रद्द करा',
    'common.delete': 'हटवा',
    'common.edit': 'संपादित करा',
    'common.view': 'पहा',
    'common.close': 'बंद करा',
    'common.submit': 'सादर करा',
    'common.back': 'मागे',
  }
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi' || savedLanguage === 'mr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Save language preference
    localStorage.setItem('language', language);
    
    // Update document direction for RTL languages (if any)
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};