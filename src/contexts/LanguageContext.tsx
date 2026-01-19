import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const translations: Translations = {
  // Common
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...' },
  'common.error': { en: 'Error', hi: 'त्रुटि', mr: 'त्रुटी' },
  'common.success': { en: 'Success', hi: 'सफलता', mr: 'यश' },
  'common.save': { en: 'Save', hi: 'सहेजें', mr: 'जतन करा' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  'common.delete': { en: 'Delete', hi: 'हटाएं', mr: 'हटवा' },
  'common.edit': { en: 'Edit', hi: 'संपादित करें', mr: 'संपादित करा' },
  'common.view': { en: 'View', hi: 'देखें', mr: 'पहा' },
  'common.back': { en: 'Back', hi: 'वापस', mr: 'मागे' },
  'common.submit': { en: 'Submit', hi: 'जमा करें', mr: 'सादर करा' },
  'common.select': { en: 'Select', hi: 'चुनें', mr: 'निवडा' },
  'common.search': { en: 'Search', hi: 'खोजें', mr: 'शोधा' },
  'common.none': { en: 'None', hi: 'कोई नहीं', mr: 'नाही' },
  'common.all': { en: 'All', hi: 'सभी', mr: 'सर्व' },
  'common.warning': { en: 'Warning', hi: 'चेतावनी', mr: 'चेतावणी' },
  'common.deleted': { en: 'Deleted', hi: 'हटाया गया', mr: 'हटवले' },
  'common.filter': { en: 'Filter', hi: 'फ़िल्टर', mr: 'फिल्टर' },
  'common.updatePreferences': { en: 'Update Preferences', hi: 'अपडेट करें', mr: 'अपडेट करा' },
  'common.required': { en: 'Required', hi: 'आवश्यक', mr: 'आवश्यक' },
  'common.locationNotSpecified': { en: 'Location not specified', hi: 'स्थान निर्दिष्ट नहीं है', mr: 'स्थान नमूद केलेले नाही' },
  'common.locationRestricted': { en: 'Location Restricted', hi: 'स्थान प्रतिबंधित', mr: 'स्थान प्रतिबंधित' },

  // Navigation
  'nav.home': { en: 'Home', hi: 'होम', mr: 'मुख्यपृष्ठ' },
  'nav.about': { en: 'About', hi: 'हमारे बारे में', mr: 'आमच्याबद्दल' },
  'nav.submitProfile': { en: 'Submit Profile', hi: 'प्रोफाइल जमा करें', mr: 'प्रोफाइल सबमिट करा' },
  'nav.myMatches': { en: 'My Matches', hi: 'मेरे मैच', mr: 'मनासारखी स्थळं' },
  'nav.requestMatch': { en: 'Request Match', hi: 'मैच अनुरोध', mr: 'जीवनसाथी' },
  'nav.successStories': { en: 'Success Stories', hi: 'सफलता की कहानियां', mr: 'यशोगाथा' },
  'nav.contact': { en: 'Contact', hi: 'संपर्क', mr: 'संपर्क' },
  'nav.admin': { en: 'Admin', hi: 'एडमिन', mr: 'अॅडमिन' },
  'nav.allProfiles': { en: 'All Profiles', hi: 'सभी प्रोफाइल', mr: 'वधू-वरांच्या सर्व प्रोफाइल्स' },

  // Auth
  'auth.login': { en: 'Login', hi: 'लॉगिन', mr: 'लॉगिन करा' },
  'auth.register': { en: 'Register', hi: 'पंजीकरण', mr: 'नाव नोंदणी' },
  'auth.email': { en: 'Email Address', hi: 'ईमेल पता', mr: 'ईमेल' },
  'auth.password': { en: 'Password', hi: 'पासवर्ड', mr: 'पासवर्ड' },
  'auth.forgotPassword': { en: 'Forgot Password?', hi: 'पासवर्ड भूल गए?', mr: 'पासवर्ड विसरलात?' },
  'auth.noAccount': { en: "Don't have an account?", hi: "खाता नहीं है?", mr: "खाते नाही?" },
  'auth.createAccount': { en: 'Create Account', hi: 'खाता बनाएं', mr: 'नवीन खाते उघडा' },
  'auth.loginSubtitle': { en: 'Welcome back! Please enter your details.', hi: 'वापसी पर स्वागत है! कृपया अपना विवरण दर्ज करें।', mr: 'नमस्कार! कृपया तुमची माहिती भरा.' },
  'auth.welcome': { en: 'Welcome back!', hi: 'वापसी पर स्वागत है!', mr: 'पुन्हा स्वागत आहे!' },
  'auth.loginSuccess': { en: 'Login successful.', hi: 'लॉगिन सफल।', mr: 'लॉगिन यशस्वी.' },
  'auth.loginFailed': { en: 'Login failed', hi: 'लॉगिन विफल', mr: 'लॉगिन अयशस्वी' },
  'auth.invalidCredentials': { en: 'Invalid login credentials', hi: 'अमान्य लॉगिन साख', mr: 'अवैध लॉगिन माहिती (ईमेल किंवा पासवर्ड चुकीचा आहे)' },
  'auth.errorGeneric': { en: 'An error occurred. Please try again.', hi: 'एक त्रुटि हुई। कृपया पुन: प्रयास करें।', mr: 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.' },
  'auth.loginToRequest': { en: 'Please login to request a match.', hi: 'कृपया मैच का अनुरोध करने के लिए लॉगिन करें।', mr: 'कृपया जोडीदाराची विनंती करण्यासाठी लॉगिन करा.' },
  'auth.loginMessage1': { en: 'Register today... Your perfect partner is waiting for you', hi: 'आज ही पंजीकरण करें… आपका सही जीवनसाथी आपकी प्रतीक्षा कर रहा है', mr: 'आजच नोंदणी करा… तुमचा योग्य जोडीदार तुमची वाट पाहतोय' },
  'auth.loginMessage2': { en: 'Login is required to view all profiles and details', hi: 'सभी प्रोफाइल और विवरण देखने के लिए लॉगिन आवश्यक है', mr: 'सर्व प्रोफाइल्स आणि माहिती पाहण्यासाठी लॉगिन आवश्यक आहे' },

  // Admin Dashboard
  'admin.dashboard': { en: 'Admin Dashboard', hi: 'एडमिन डैशबोर्ड', mr: 'मुख्य नियंत्रण केंद्र' },
  'admin.stats.premium': { en: 'Premium Users', hi: 'प्रीमियम उपयोगकर्ता', mr: 'प्रीमियम सभासद' },
  'admin.stats.requests': { en: 'Requests', hi: 'अनुरोध', mr: 'विनंत्या' },
  'admin.stats.totalUsers': { en: 'Total Users', hi: 'कुल उपयोगकर्ता', mr: 'एकूण सभासद' },
  'admin.stats.messages': { en: 'Messages', hi: 'संदेश', mr: 'संदेश' },

  'admin.tab.profiles': { en: 'Profiles', hi: 'प्रोफाइल', mr: 'प्रोफाईल्स' },
  'admin.tab.requests': { en: 'Requests', hi: 'अनुरोध', mr: 'विनंत्या' },
  'admin.tab.users': { en: 'Users', hi: 'उपयोगकर्ता', mr: 'सभासद' },
  'admin.tab.messages': { en: 'Messages', hi: 'संदेश', mr: 'संदेश' },
  'admin.tab.addUser': { en: 'Add New User', hi: 'नया उपयोगकर्ता जोड़ें', mr: 'नवीन सदस्य जोडा' },
  'admin.tab.settings': { en: 'Settings', hi: 'सेटिंग्स', mr: 'सेटिंग्ज' },
  'admin.tab.shared': { en: 'Shared Profiles', hi: 'साझा प्रोफाइल', mr: 'शेअर केलेल्या प्रोफाईल्स' },

  'admin.settings.title': { en: 'System Settings', hi: 'सिस्टम सेटिंग्स', mr: 'प्रणाली सेटिंग्ज' },
  'admin.settings.desc': { en: 'Manage global application configurations.', hi: 'वैश्विक एप्लिकेशन कॉन्फ़िगरेशन प्रबंधित करें।', mr: 'संपूर्ण ऍप्लिकेशनचे नियंत्रण करा.' },
  'admin.settings.paymentWall': { en: 'Payment Requirement for Requests', hi: 'अनुरोध के लिए भुगतान की आवश्यकता', mr: 'विनंतीसाठी प्रीमियम अट' },
  'admin.settings.paymentWallDesc': {
    en: 'If enabled, non-premium users will be blocked from sending match requests. Premium users are always allowed.',
    hi: 'यदि सक्षम किया जाता है, तो गैर-प्रीमियम उपयोगकर्ताओं को मैच अनुरोध भेजने से रोक दिया जाएगा। प्रीमियम उपयोगकर्ताओं को हमेशा अनुमति है।',
    mr: 'ही सुविधा चालू केल्यास, विना-प्रीमियम सदस्य विनंती पाठवू शकणार नाहीत. फक्त प्रीमियम सदस्यांना परवानगी असेल.'
  },
  'admin.settings.preview': { en: 'Preview', hi: 'पूर्वावलोकन', mr: 'पूर्वावलोकन' },
  'admin.settings.previewText': {
    en: 'Redirects users to the Payment Info Page if they try to request a match without Premium status.',
    hi: 'यदि उपयोगकर्ता प्रीमियम स्थिति के बिना मैच का अनुरोध करने का प्रयास करते हैं तो उन्हें भुगतान जानकारी पृष्ठ पर पुनर्निर्देशित करता है।',
    mr: 'जर एखाद्या सदस्याने प्रीमियम नसताना विनंती करण्याचा प्रयत्न केला, तर त्यांना पेमेंट माहितीच्या पानावर पाठवले जाईल.'
  },
  'nav.login': { en: 'Login', hi: 'लॉगिन', mr: 'लॉगिन' },
  'nav.register': { en: 'Register', hi: 'रजिस्टर', mr: 'नोंदणी' },
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  'nav.logout': { en: 'Logout', hi: 'लॉगआउट', mr: 'बाहेर पडा' },


  // Hero Section
  'hero.title': {
    en: 'Trusted Community Matchmaking Service',
    hi: 'विश्वसनीय सामुदायिक विवाह सेवा',
    mr: 'विश्वास आमचा, साथ तुमची... सोहळा संसाराचा!'
  },
  'hero.subtitle': {
    en: 'Personal • Private • Verified',
    hi: 'व्यक्तिगत • निजी • सत्यापित',
    mr: 'आपली माणसं • आपली सुरक्षा • आपली खात्री'
  },
  'hero.description': {
    en: 'We bring the trust of traditional matchmaking into the digital world. Profiles are carefully curated and shared only with suitable matches — never public.',
    hi: 'हम पारंपरिक विवाह सेवा के विश्वास को डिजिटल दुनिया में लाते हैं। प्रोफाइल सावधानी से चुने जाते हैं और केवल उपयुक्त मैचों के साथ साझा किए जाते हैं — कभी सार्वजनिक नहीं।',
    mr: 'विवाह हा विश्वासाचा निर्णय असतो — आणि तोच विश्वास आम्ही जपतो. पारंपारिक पद्धतीने निवडलेली, सत्यापित प्रोफाइल्स फक्त योग्य स्थळांसोबतच शेअर केल्या जातात. तुमची गोपनीयता आमच्यासाठी सर्वोच्च आहे.'
  },
  'hero.submitProfile': { en: 'Submit Profile Free', hi: 'मुफ्त प्रोफाइल जमा करें', mr: 'मोफत नाव नोंदणी करा' },
  'hero.myProfile': { en: 'My Profile', hi: 'मेरी प्रोफाइल', mr: 'माझे प्रोफाइल' },
  'hero.requestMatch': { en: 'Request a Match', hi: 'मैच अनुरोध करें', mr: 'जीवनसाथी' },

  // Why Choose Us
  'why.title': { en: 'Why Choose Us', hi: 'हमें क्यों चुनें', mr: 'हे कसं चालतं?' },
  'why.privacy': { en: 'Complete privacy', hi: 'पूर्ण गोपनीयता', mr: 'तुमच्या संमतीशिवाय माहिती बाहेर जाणार नाही' },
  'why.noBrowsing': { en: 'No public profile browsing', hi: 'कोई सार्वजनिक प्रोफाइल ब्राउज़िंग नहीं', mr: 'तुमचा फोटो सगळ्यांना दिसणार नाही' },
  'why.verified': { en: 'Admin-verified matches', hi: 'एडमिन-सत्यापित मैच', mr: 'विश्वासाच्या रेशीमगाठी' },
  'why.trusted': { en: 'Trusted community service', hi: 'विश्वसनीय सामुदायिक सेवा', mr: 'समाजाची साथ, विश्वासाची गाठ' },
  'why.personal': { en: 'Personal matchmaking support', hi: 'व्यक्तिगत विवाह सहायता', mr: 'जोडीदार मिळेपर्यंत आम्ही तुमच्या सोबत आहोत' },

  // How It Works
  'how.title': { en: 'How It Works', hi: 'यह कैसे काम करता है', mr: 'हे कसे कार्य करते' },
  'how.step1': { en: 'Submit your profile for free', hi: 'अपना प्रोफाइल मुफ्त में जमा करें', mr: 'तुमची माहिती मोफत नोंदवा.' },
  'how.step2': { en: 'Send your requirements', hi: 'अपनी आवश्यकताएं भेजें', mr: 'तुम्हाला अपेक्षित जोडीदार कसा हवा, ते आम्हाला सांगा.' },
  'how.step3': { en: 'Admin selects suitable matches', hi: 'एडमिन उपयुक्त मैच चुनता है', mr: 'तुमच्या पसंतीनुसार आम्ही योग्य स्थळं शोधतो.' },
  'how.step4': { en: 'Profiles shared personally', hi: 'प्रोफाइल व्यक्तिगत रूप से साझा', mr: 'निवडलेली माहिती फक्त तुम्हालाच वैयक्तिकरित्या पाठवली जाईल.' },
  'how.step5': { en: 'Families connect with confidence', hi: 'परिवार आत्मविश्वास से जुड़ते हैं', mr: 'खात्रीने पाऊल उचला आणि दोन कुटुंबं एकत्र आणा' },

  // Privacy Promise
  'privacyPromise.title': { en: 'Privacy Promise', hi: 'गोपनीयता का वादा', mr: 'गुप्ततेची खात्री' },
  'privacy.description': {
    en: 'Your personal details are never displayed publicly. Only the matchmaker can access full data.',
    hi: 'आपका व्यक्तिगत विवरण कभी सार्वजनिक रूप से प्रदर्शित नहीं होता। केवल विवाह सहायक पूर्ण डेटा एक्सेस कर सकता है।',
    mr: 'तुमची वैयक्तिक माहिती आम्ही जगासमोर कधीही उघड करणार नाही. तुमची संपूर्ण माहिती फक्त आमच्या मॅरेज असिस्टंटलाच दिसेल, जेणेकरून तुमची प्रायव्हसी पूर्णपणे जपली जाईल.'
  },

  // Success Stories
  'success.title': { en: 'Success Stories', hi: 'सफलता की कहानियां', mr: 'आनंदाचे साक्षीदार' },
  'success.subtitle': {
    en: 'Hundreds of happy marriages built on trust and care.',
    hi: 'विश्वास और देखभाल पर बने सैकड़ों सुखी विवाह।',
    mr: 'फक्त लग्नं नाही, तर विश्वासाने विणलेले शेकडो \'सुखी संसार\' आणि साठवलेले \'हजारो आनंदी क्षण\'!'
  },
  'success.viewAll': { en: 'View Success Stories', hi: 'सफलता की कहानियां देखें', mr: 'यशोगाथा पहा' },

  // Footer
  'footer.tagline': {
    en: 'Bringing families together with trust and tradition.',
    hi: 'विश्वास और परंपरा के साथ परिवारों को जोड़ना।',
    mr: 'विश्वास आणि परंपरेने कुटुंबांना एकत्र आणणे.'
  },
  'footer.quickLinks': { en: 'Quick Links', hi: 'त्वरित लिंक', mr: 'महत्त्वाची पाने' },
  'footer.legal': { en: 'Legal', hi: 'कानूनी', mr: 'वेबसाइट वापरण्याचे नियम' },
  'footer.terms': { en: 'Terms & Conditions', hi: 'नियम और शर्तें', mr: 'नियम आणि अटी' },
  'footer.privacyPolicy': { en: 'Privacy Policy', hi: 'गोपनीयता नीति', mr: 'गोपनीयता धोरण' },
  'footer.rights': { en: 'All rights reserved.', hi: 'सर्वाधिकार सुरक्षित।', mr: 'सर्व हक्क राखीव.' },
  'footer.copyright': { en: 'ShubhVivahBandhan. All rights reserved.', hi: 'शुभविवाहबंधन. सर्वाधिकार सुरक्षित।', mr: 'शुभविवाहबंधन. हक्काची सोयरिक, हक्काचा विश्वास.' },

  // Profile Form
  'profile.personalDetails': { en: 'Personal Details', hi: 'व्यक्तिगत विवरण', mr: 'वैयक्तिक तपशील' },
  'profile.fullName': { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
  'profile.age': { en: 'Age', hi: 'आयु', mr: 'वय' },
  'profile.gender': { en: 'Gender', hi: 'लिंग', mr: 'लिंग' },
  'profile.male': { en: 'Male (Groom)', hi: 'पुरुष (वर)', mr: 'पुरुष (वर)' },
  'profile.female': { en: 'Female (Bride)', hi: 'महिला (वधू)', mr: 'स्त्री (वधू)' },
  'profile.height': { en: 'Height', hi: 'ऊंचाई', mr: 'उंची' },
  'profile.maritalStatus': { en: 'Marital Status', hi: 'वैवाहिक स्थिति', mr: 'वैवाहिक स्थिती' },
  'profile.never': { en: 'Never Married', hi: 'कभी विवाहित नहीं', mr: 'कधी विवाहित नाही' },
  'profile.divorced': { en: 'Divorced', hi: 'तलाकशुदा', mr: 'घटस्फोटित' },
  'profile.widowed': { en: 'Widowed', hi: 'विधुर/विधवा', mr: 'विधुर/विधवा' },
  'profile.education': { en: 'Education', hi: 'शिक्षा', mr: 'शिक्षण' },
  'profile.profession': { en: 'Profession', hi: 'पेशा', mr: 'व्यवसाय' },
  'profile.income': { en: 'Annual Income', hi: 'वार्षिक आय', mr: 'वार्षिक उत्पन्न' },
  'profile.religion': { en: 'Religion (Optional)', hi: 'धर्म (वैकल्पिक)', mr: 'धर्म (पर्यायी)' },
  'profile.caste': { en: 'Caste', hi: 'जाति', mr: 'जात' },
  'profile.location': { en: 'Location', hi: 'स्थान', mr: 'स्थान' },
  'profile.familyBackground': { en: 'Family Background', hi: 'पारिवारिक पृष्ठभूमि', mr: 'कौटुंबिक पार्श्वभूमी' },
  'profile.lifestyle': { en: 'Lifestyle Preferences', hi: 'जीवनशैली प्राथमिकताएं', mr: 'जीवनशैली प्राधान्ये' },
  'profile.about': { en: 'About Yourself', hi: 'अपने बारे में', mr: 'स्वतःबद्दल' },
  'profile.photo': { en: 'Profile Photo', hi: 'प्रोफाइल फोटो', mr: 'प्रोफाइल फोटो' },
  'profile.consent': {
    en: 'I agree my profile may be shared with suitable matches after admin approval.',
    hi: 'मैं सहमत हूं कि मेरा प्रोफाइल एडमिन की मंजूरी के बाद उपयुक्त मैचों के साथ साझा किया जा सकता है।',
    mr: 'मी सहमत आहे की माझे प्रोफाइल प्रशासकाच्या मंजुरीनंतर योग्य जोड्यांसह शेअर केले जाऊ शकते.'
  },
  'profile.submit': { en: 'Submit Profile', hi: 'प्रोफाइल जमा करें', mr: 'प्रोफाइल सबमिट करा' },
  'profile.required': { en: 'Profile Required', hi: 'प्रोफाइल आवश्यक', mr: 'प्रोफाईल आवश्यक' },
  'profile.requiredDesc': { en: 'Please submit your profile details before requesting a match.', hi: 'कृपया मैच का अनुरोध करने से पहले अपना प्रोफाइल विवरण जमा करें।', mr: 'जोडीदाराची विनंती करण्यापूर्वी तुमची प्रोफाईल माहिती भरणे आवश्यक आहे' },

  // Match Request
  'match.title': { en: 'Request a Match', hi: 'मैच अनुरोध करें', mr: 'संसाराची शुभ सुरुवात, निवडा तुमची हक्काची सोयरिक' },
  'match.description': {
    en: 'Tell us what you are looking for. Our team will find suitable matches for you.',
    hi: 'हमें बताएं कि आप क्या खोज रहे हैं। हमारी टीम आपके लिए उपयुक्त मैच खोजेगी।',
    mr: 'तुमच्या सुखी संसाराची पहिली पाऊलवाट...'
  },
  'match.preferences': { en: 'Your Preferences', hi: 'आपकी प्राथमिकताएं', mr: 'जोडीदाराकडून तुमच्या अपेक्षा' },
  'match.ageRange': { en: 'Preferred Age Range', hi: 'पसंदीदा आयु सीमा', mr: 'वयाची मर्यादा (पासून - पर्यंत)' },
  'match.heightRange': { en: 'Preferred Height Range', hi: 'पसंदीदा ऊंचाई सीमा', mr: 'अपेक्षित उंची (पासून - पर्यंत)' },
  'match.educationPref': { en: 'Education Preference', hi: 'शिक्षा प्राथमिकता', mr: 'शिक्षणाबद्दलची तुमची आवड' },
  'match.locationPref': { en: 'Location Preference', hi: 'स्थान प्राथमिकता', mr: 'पसंतीचे शहर किंवा गाव' },
  'match.additionalReq': { en: 'Additional Requirements', hi: 'अतिरिक्त आवश्यकताएं', mr: 'इतर अपेक्षा' },
  'match.sendRequest': { en: 'Send Request', hi: 'अनुरोध भेजें', mr: 'विनंती पाठवा' },

  'match.viewSubmitted': { en: 'View Submitted Data', hi: 'जमा किए गए डेटा देखें', mr: 'दिलेली माहिती पहा' },
  'match.hideSubmitted': { en: 'Hide Submitted Data', hi: 'जमा किए गए डेटा छिपाएं', mr: 'दिलेली माहिती लपवा' },
  'match.sendNewRequest': { en: 'Send New Request', hi: 'नया अनुरोध भेजें', mr: 'नवीन विनंती पाठवा' },
  'match.label.age': { en: 'Age Range', hi: 'आयु सीमा', mr: 'वय' },
  'match.label.height': { en: 'Height', hi: 'ऊंचाई', mr: 'उंची' },
  'match.label.education': { en: 'Education', hi: 'शिक्षा', mr: 'शिक्षण' },
  'match.label.location': { en: 'Location', hi: 'स्थान', mr: 'ठिकाण' },
  'match.label.note': { en: 'Note', hi: 'टिप्पणी', mr: 'टीप' },
  'common.years': { en: 'years', hi: 'years', mr: 'वर्षे' },
  'common.ft': { en: 'ft', hi: 'ft', mr: 'फूट' },



  // Password Reset Pages
  'forgotPassword.title': { en: 'Reset Password', hi: 'पासवर्ड रीसेट करें', mr: 'पासवर्ड रीसेट करा' },
  'forgotPassword.subtitle': { en: 'Enter your email to receive a reset link.', hi: 'रीसेट लिंक प्राप्त करने के लिए अपना ईमेल दर्ज करें।', mr: 'रीसेट लिंक प्राप्त करण्यासाठी तुमचा ईमेल प्रविष्ट करा.' },
  'forgotPassword.emailLabel': { en: 'Email Address', hi: 'ईमेल पता', mr: 'ईमेल पत्ता' },
  'forgotPassword.submitBtn': { en: 'Send Reset Link', hi: 'रीसेट लिंक भेजें', mr: 'रीसेट लिंक पाठवा' },
  'forgotPassword.backToLogin': { en: 'Back to Login', hi: 'लॉगिन पर वापस जाएं', mr: 'लॉगिन वर परत जा' },
  'forgotPassword.success': { en: 'Check your email for the reset link.', hi: 'रीसेट लिंक के लिए अपना ईमेल देखें।', mr: 'रीसेट लिंकसाठी तुमचा ईमेल तपासा.' },
  'forgotPassword.accountNotFound': {
    en: 'Account is not found, you have to register first.',
    hi: 'खाता नहीं मिला, आपको पहले पंजीकरण करना होगा।',
    mr: 'खाते सापडले नाही, तुम्हाला आधी नोंदणी करणे आवश्यक आहे.'
  },

  'updatePassword.title': { en: 'Set New Password', hi: 'नया पासवर्ड सेट करें', mr: 'नवीन पासवर्ड सेट करा' },
  'updatePassword.subtitle': { en: 'Enter your new password below.', hi: 'अपना नया पासवर्ड नीचे दर्ज करें।', mr: 'तुमचा नवीन पासवर्ड खाली प्रविष्ट करा.' },
  'updatePassword.newPassword': { en: 'New Password', hi: 'नया पासवर्ड', mr: 'नवीन पासवर्ड' },
  'updatePassword.submitBtn': { en: 'Update Password', hi: 'पासवर्ड अपडेट करें', mr: 'पासवर्ड अपडेट करा' },
  'updatePassword.success': { en: 'Password updated successfully.', hi: 'पासवर्ड सफलतापूर्वक अपडेट किया गया।', mr: 'पासवर्ड यशस्वीरित्या अपडेट केला.' },

  'validation.errorTitle': { en: 'Validation Error', hi: 'सत्यापन त्रुटि', mr: 'चुकीचा नंबर' },
  'validation.phoneLength': { en: 'Phone number must be exactly 10 digits.', hi: 'फ़ोन नंबर बिल्कुल 10 अंकों का होना चाहिए।', mr: 'कृपया १० अंकी मोबाईल नंबर टाका.' },

  // Admin

  'common.to': { en: 'to', hi: 'से', mr: 'ते' },
  'common.at': { en: 'at', hi: ' - ', mr: ' - ' },
  'admin.profiles': { en: 'Manage Profiles', hi: 'प्रोफाइल प्रबंधित करें', mr: 'प्रोफाइल व्यवस्थापित करा' },
  'admin.requests': { en: 'Match Requests', hi: 'मैच अनुरोध', mr: 'जोडी विनंत्या' },
  'admin.successStories': { en: 'Success Stories', hi: 'सफलता की कहानियां', mr: 'यशोगाथा' },
  'admin.messages': { en: 'Messages', hi: 'संदेश', mr: 'संदेश' },
  'admin.shareProfile': { en: 'Share Profile', hi: 'प्रोफाइल साझा करें', mr: 'प्रोफाईल शेअर करा' },
  'admin.shareSuccess': { en: 'Profile Shared Successfully', hi: 'प्रोफाइल सफलतापूर्वक साझा की गई', mr: 'प्रोफाईल यशस्वीरित्या शेअर केले' },

  'register.photoCompressionFailed': { en: 'Could not compress image. Uploading original size.', hi: 'छवि को संपीड़ित नहीं किया जा सका। मूल आकार अपलोड किया जा रहा है।', mr: 'फोटो कॉम्प्रेस करता आला नाही. मूळ साईज अपलोड करत आहोत.' },
  'register.photoRequired': { en: 'Profile photo is required.', hi: 'प्रोफाइल फोटो आवश्यक है।', mr: 'प्रोफाइल फोटो आवश्यक आहे.' },
  'register.photoUploadFailed': { en: 'Could not upload photo, but continuing registration.', hi: 'फोटो अपलोड नहीं किया जा सका, लेकिन पंजीकरण जारी है।', mr: 'फोटो अपलोड होऊ शकला नाही, पण नोंदणी सुरू आहे.' },
  'register.successTitle': { en: 'Success!', hi: 'सफल!', mr: 'यशस्वी!' },
  'register.successDesc': { en: 'Profile created successfully.', hi: 'प्रोफाइल सफलतापूर्वक बनाई गई।', mr: 'प्रोफाइल यशस्वीरित्या तयार झाले.' },
  'register.failedTitle': { en: 'Registration failed', hi: 'पंजीकरण विफल', mr: 'नोंदणी अयशस्वी' },
  'error.loadProfile': { en: 'Failed to load profile data', hi: 'प्रोफाइल डेटा लोड करने में विफल', mr: 'प्रोफाइल माहिती लोड करण्यास अयशस्वी' },
  'error.profileNotFound': { en: 'Profile not found', hi: 'प्रोफाइल नहीं मिला', mr: 'प्रोफाइल सापडले नाही' },

  'admin.selectUser': { en: 'Select User to Share With', hi: 'साझा करने के लिए उपयोगकर्ता चुनें', mr: 'शेअर करण्यासाठी वापरकर्ता निवडा' },
  'admin.storyHint': {
    en: 'Admin Only: Add or remove stories. Images change automatically every 2 seconds.',
    hi: 'केवल एडमिन: कहानियां जोड़ें या हटाएं। छवियां हर 2 सेकंड में स्वचालित रूप से बदलती हैं।',
    mr: 'फक्त ॲडमिनसाठी: यशोगाथा जोडा किंवा काढून टाका. फोटो आपोआप दर २ सेकंदांनी बदलतील.'
  },



  // Dashboard
  'dashboard.myProfiles': { en: 'My Profiles', hi: 'मेरी प्रोफाइल्स', mr: 'माझ्या प्रोफाइल्स' },
  'dashboard.sharedWithMe': { en: 'Profiles Shared With Me', hi: 'मेरे साथ साझा की गई प्रोफाइल', mr: 'माझ्यासोबत शेअर केलेल्या प्रोफाइल्स' },
  'dashboard.matchRequests': { en: 'Match Requests', hi: 'मैच अनुरोध', mr: 'सामना विनंत्या' },
  'dashboard.quickActions': { en: 'Quick Actions', hi: 'त्वरित कार्रवाई', mr: 'जलद क्रिया' },
  'dashboard.assignedProfiles': { en: 'Assigned Profiles (Matches)', hi: 'असाइन की गई प्रोफाइल', mr: 'असाइन केलेल्या प्रोफाइल्स (जोड्या)' },
  'dashboard.mySubmitted': { en: 'My Submitted Profiles', hi: 'मेरी जमा की गई प्रोफाइल', mr: 'माझ्या सबमिट केलेल्या प्रोफाइल्स' },
  'dashboard.noShared': { en: 'No profiles have been shared with you yet. The matchmaker will share suitable profiles based on your requirements.', hi: 'अभी तक आपके साथ कोई प्रोफाइल साझा नहीं की गई है। मैचमेकर आपकी आवश्यकताओं के आधार पर उपयुक्त प्रोफाइल साझा करेगा।', mr: 'अद्याप तुमच्यासोबत कोणतीही प्रोफाइल शेअर केलेली नाही. जुळवणीकार तुमच्या गरजांवर आधारित योग्य प्रोफाइल शेअर करेल.' },
  'dashboard.noSubmitted': { en: "You haven't submitted any profiles yet. Click 'Submit New Profile' to get started.", hi: 'आपने अभी तक कोई प्रोफाइल जमा नहीं की है। शुरू करने के लिए \'नई प्रोफाइल जमा करें\' पर क्लिक करें।', mr: "तुम्ही अद्याप कोणतीही प्रोफाइल सबमिट केलेली नाही. सुरू करण्यासाठी 'नवीन प्रोफाइल सबमिट करा' वर क्लिक करा." },
  'dashboard.clickEdit': { en: 'Click to Edit', hi: 'संपादित करने के लिए क्लिक करें', mr: 'संपादित करण्यासाठी क्लिक करा' },

  // Profile View
  'profile.premiumService': { en: 'Premium Matchmaking Service', hi: 'प्रीमियम मैचमेकिंग सेवा', mr: 'प्रीमियम शुभविवाहबंधन सेवा' },

  // Matches & Requests
  'nav.viewProfile': { en: 'View Profile', hi: 'प्रोफाइल देखें', mr: 'प्रोफाइल पहा' },
  'nav.editProfile': { en: 'Edit Profile', hi: 'प्रोफाइल संपादित करें', mr: 'प्रोफाइल संपादित करा' },

  'match.status.submitted.title': { en: 'Request Submitted', hi: 'अनुरोध जमा किया गया', mr: 'विनंती सबमिट केली' },
  'match.status.submitted.desc': { en: 'You have submitted a request. The ShubhVivahBandhan team will review your profile and send you matches shortly.', hi: 'आपने एक अनुरोध जमा किया है। हमारी टीम आपकी समीक्षा करेगी और जल्द ही मैच भेजेगी।', mr: 'तुम्ही विनंती सबमिट केली आहे. आमची टीम तुमच्या प्रोफाइलचे पुनरावलोकन करेल आणि तुम्हाला लवकरच जोड्या पाठवेल.' },
  'match.success.title': { en: 'Request Sent Successfully', hi: 'अनुरोध सफलतापूर्वक भेजा गया', mr: 'विनंती यशस्वीरित्या पाठवली' },
  'match.success.desc': { en: 'We have received your partner preferences.', hi: 'हमें आपकी प्राथमिकताएं प्राप्त हुई हैं।', mr: 'आम्हाला तुमची जोडीदाराबद्दलची पसंती मिळाली आहे.' },
  'match.status.found.title': { en: 'Matches Found!', hi: 'मैच मिले!', mr: 'जोड्या सापडल्या!' },
  'match.status.found.desc': { en: 'Admin has shared matches with you based on your preferences.', hi: 'एडमिन ने आपके साथ मैच साझा किए हैं।', mr: 'प्रशासकाने तुमच्या पसंतीनुसार तुमच्यासोबत जोड्या शेअर केल्या आहेत.' },
  'common.viewMatches': { en: 'View Matches', hi: 'मैच देखें', mr: 'जोड्या पहा' },
  'common.backHome': { en: 'Back to Home', hi: 'मुख्य पृष्ठ पर वापस', mr: 'मुख्यपृष्ठावर परत' },

  // My Matches Page
  'myMatches.subtitle': {
    en: 'Your personalized partner search journey',
    hi: 'आपकी व्यक्तिगत साथी खोज यात्रा',
    mr: 'तुमच्या सुखी संसाराची पहिली पाऊलवाट!\nतुमच्या आवडीची जपणूक आणि आमचा प्रामाणिक शोध... तुमची रेशीमगाठ जुळवण्याचा एक हक्काचा प्रवास!'
  },
  'common.noRequest.title': { en: 'You haven\'t requested a match yet', hi: 'आपने अभी तक कोई अनुरोध नहीं किया है', mr: 'तुमची ओढ, आमचा शोध!' },
  'common.noRequest.desc': { en: 'To find your perfect partner, please tell us your preferences. Our team will manually select the best profiles for you.', hi: 'आदर्श जीवनसाथी खोजने के लिए, अपनी प्राथमिकताएं बताएं। हमारी टीम आपके लिए सर्वश्रेष्ठ प्रोफाइल चुनेगी।', mr: 'आम्ही अजून तुमच्या पसंतीची वाट पाहत आहोत. आम्हाला तुमची आवड कळवा, आणि तुमच्या स्वप्नातील जोडीदाराला भेटवण्याची जबाबदारी आमच्यावर सोडा.' },
  'common.findPartner': { en: 'Find Your Partner', hi: 'अपना साथी खोजें', mr: 'तुमचा जोडीदार शोधा' },
  'common.requestReceived.title': { en: 'Request Received', hi: 'अनुरोध प्राप्त हुआ', mr: 'तुमची विनंती अॅडमिनकडे गेली आहे, लवकरच तुम्हाला अपडेट मिळेल.' },
  'common.requestReceived.desc': { en: 'We have received your partner preferences. Our team is currently reviewing profiles to find the best match for you. You will see them here soon.', hi: 'हमें आपकी प्राथमिकताएं मिली हैं। हमारी टीम प्रोफाइल की समीक्षा कर रही है। आप उन्हें जल्द ही यहां देखेंगे।', mr: 'तुमची आवड आमच्यापर्यंत पोहोचली आहे... तुमच्या स्वप्नातील जोडीदार शोधण्याची जबाबदारी आता आमची! आमची टीम मनापासून तुमची पसंती तपासून पाहत आहे. थोडा वेळ द्या, तुमच्या आयुष्याचा खरा सोबती लवकरच तुमच्यासमोर असेल.' },

  'common.processing': { en: 'Processing...', hi: 'प्रक्रिया जारी...', mr: 'रेशीमगाठी जुळवण्याचं काम सुरू आहे...' },
  'common.profilesForYou': { en: 'Profiles for you', hi: 'आपके लिए प्रोफाइल', mr: 'तुमच्यासाठी प्रोफाइल' },
  'common.matched': { en: 'Matched', hi: 'मैच', mr: 'जुळले' },
  'common.viewFullProfile': { en: 'View Full Profile', hi: 'पूरी प्रोफाइल देखें', mr: 'पूर्ण प्रोफाइल पहा' },
  'common.nameHidden': { en: 'Name Hidden', hi: 'नाम छिपा हुआ', mr: 'नाव लपवले आहे' },
  'common.yrs': { en: 'Yrs', hi: 'वर्ष', mr: 'वर्षे' },
  'common.age': { en: 'Age', hi: 'आयु', mr: 'वय' },
  'common.height': { en: 'Height', hi: 'ऊंचाई', mr: 'उंची' },
  'common.joined': { en: 'Joined', hi: 'जुड़ गए', mr: 'सहभागी झाले' },
  'common.status': { en: 'Status', hi: 'स्थिति', mr: 'स्थिती' },
  'common.loc': { en: 'Loc', hi: 'स्थान', mr: 'स्थान' },
  'common.download': { en: 'Download', hi: 'डाउनलोड', mr: 'डाउनलोड' },

  // Register Page
  'register.title': { en: 'Create Your Profile', hi: 'अपनी प्रोफाइल बनाएं', mr: 'आजच तुमचं नाव नोंदवा' },
  'register.subtitle': { en: 'Join our trusted community and find your perfect match', hi: 'हमारे विश्वसनीय समुदाय में शामिल हों और अपना सही जीवनसाथी पाएं', mr: 'आमच्या विश्वासाच्या परिवारात सामील व्हा आणि तुमच्या संसारासाठी हक्काची सोयरिक निवडा.' },
  'register.submissionFree': { en: 'Profile submission is completely free.', hi: 'प्रोफाइल सबमिशन पूरी तरह से मुफ्त है।', mr: 'प्रोफाइल नोंदणी पूर्णपणे मोफत आहे.' },

  // Sections
  'register.accountInfo': { en: 'Account Information', hi: 'खाता जानकारी', mr: 'तुमची माहिती' },
  'register.basicInfo': { en: 'Basic Information', hi: 'मूलभूत जानकारी', mr: 'बायो-डेटा' },
  'register.eduCareer': { en: 'Education & Career', hi: 'शिक्षा और करियर', mr: 'शिक्षण' },
  'register.location': { en: 'Location', hi: 'स्थान', mr: 'राहण्याचे ठिकाण' },
  'register.familyDetails': { en: 'Family Details', hi: 'पारिवारिक विवरण', mr: 'घरच्यांची माहिती' },
  'register.about': { en: 'About', hi: 'परिचय', mr: 'तुमच्याबद्दल थोडे काही' },
  'register.photo': { en: 'Profile Photo', hi: 'प्रोफाइल फोटो', mr: 'फोटो आणि नोंदणी' },

  // Fields
  'register.email': { en: 'Email', hi: 'ईमेल', mr: 'ईमेल' },
  'register.password': { en: 'Password', hi: 'पासवर्ड', mr: 'पासवर्ड' },
  'register.phone': { en: 'Phone', hi: 'फोन', mr: 'फोन' },
  'register.gender': { en: 'Gender', hi: 'लिंग', mr: 'मुलगा की मुलगी?' },
  'register.firstName': { en: 'First Name', hi: 'पहला नाम', mr: 'तुमचं नाव' },
  'register.middleName': { en: 'Middle Name', hi: 'मध्य नाम', mr: 'वडिलांचे नाव' },
  'register.lastName': { en: 'Last Name', hi: 'उपनाम', mr: 'आडनाव' },
  'register.dob': { en: 'Date of Birth', hi: 'जन्म तिथि', mr: 'जन्माची तारीख' },
  'register.height': { en: 'Height', hi: 'ऊंचाई', mr: 'उंची किती आहे?' },
  'register.maritalStatus': { en: 'Marital Status', hi: 'वैवाहिक स्थिति', mr: 'लग्नाबद्दलची सद्यस्थिती' },
  'register.religion': { en: 'Religion', hi: 'धर्म', mr: 'धर्म' },
  'register.caste': { en: 'Caste', hi: 'जाति', mr: 'तुमची जात' },
  'register.rashi': { en: 'Ras Name (Rashi)', hi: 'रास', mr: 'रास' },
  'register.fatherContact': { en: 'Father\'s Contact No', hi: 'पिता का संपर्क नंबर', mr: 'वडिलांचा मोबाईल नंबर' },
  'register.eduLevel': { en: 'Education Level', hi: 'शिक्षा स्तर', mr: 'शिक्षण किती झालंय?' },
  'register.college': { en: 'College/University', hi: 'कॉलेज/विश्वविद्यालय', mr: 'कॉलेजचं नाव' },
  'register.profession': { en: 'Profession', hi: 'पेशा', mr: 'नोकरी / व्यवसाय' },
  'register.company': { en: 'Company', hi: 'कंपनी', mr: 'कंपनी' },
  'register.income': { en: 'Income', hi: 'आय', mr: 'वर्षाची कमाई किती आहे?' },
  'register.country': { en: 'Country', hi: 'देश', mr: 'देश' },
  'register.state': { en: 'State', hi: 'राज्य', mr: 'राज्य' },
  'register.city': { en: 'City', hi: 'शहर', mr: 'गाव/शहर' },
  'register.familyType': { en: 'Family Type', hi: 'परिवार का प्रकार', mr: 'कुटुंब कसं आहे?' },
  'register.fullAddress': { en: 'Full Address', hi: 'पूरा पता', mr: 'घरचा पत्ता' },
  'register.fatherOcc': { en: 'Father\'s Occupation', hi: 'पिता का व्यवसाय', mr: 'वडील काय करतात?' },
  'register.fatherName': { en: 'Father\'s Name', hi: 'पिता का नाम', mr: 'वडिलांचे पूर्ण नाव' },
  'register.motherName': { en: 'Mother\'s Name', hi: 'माता का नाम', mr: 'आईचे नाव' },
  'register.brotherName': { en: 'Brother\'s Name', hi: 'भाई का नाम', mr: 'भावाचे नाव' },
  'register.sisterName': { en: 'Sister\'s Name', hi: 'बहन का नाम', mr: 'बहिणीचे नाव' },
  'register.motherOcc': { en: 'Mother\'s Occupation', hi: 'माता का व्यवसाय', mr: 'आई काय करतात?' },
  'register.siblings': { en: 'Siblings', hi: 'भाई-बहन', mr: 'भाऊ-बहीण किती आहेत?' },
  'register.bio': { en: 'About (Bio)', hi: 'बायो', mr: 'तुमच्याबद्दल थोडक्यात सांगा' },
  'register.uploadPhoto': { en: 'Upload Photo', hi: 'फोटो अपलोड करें', mr: 'फोटो पाठवा' },
  'register.photoHint': { en: 'Max size 5MB. Formats: JPG, PNG.', hi: 'अधिकतम 5MB. प्रारूप: JPG, PNG.', mr: 'जास्तीत जास्त 5MB. स्वरूप: JPG, PNG.' },
  'register.motherTongue': { en: 'Mother Tongue', hi: 'मातृभाषा', mr: 'मातृभाषा' },
  'register.familyValues': { en: 'Family Values', hi: 'पारिवारिक मूल्य', mr: 'कौटुंबिक मूल्ये' },
  'register.birthTime': { en: 'Time of Birth', hi: 'जन्म समय', mr: 'जन्माची वेळ' },
  'profile.birthTime': { en: 'Time of Birth', hi: 'जन्म समय', mr: 'जन्माची वेळ' },
  'profile.birthPlace': { en: 'Place of Birth', hi: 'जन्म स्थान', mr: 'जन्म ठिकाण' },

  // Actions
  'register.submit': { en: 'Create Profile', hi: 'प्रोफाइल बनाएं', mr: 'आजच नाव नोंदवा' },
  'register.haveAccount': { en: 'Already have an account?', hi: 'क्या आपके पास पहले से खाता है?', mr: 'आधीच नाव नोंदवलंय का? मग इथे या.' },
  'register.loginHere': { en: 'Login here', hi: 'यहाँ लॉगिन करें', mr: 'येथे लॉगिन करा' },
  'admin.addUser': { en: 'Add New User', hi: 'नया उपयोगकर्ता जोड़ें', mr: 'नवीन वापरकर्ता जोडा' },
  'admin.chooseFile': { en: 'Choose File', hi: 'फ़ाइल चुनें', mr: 'फाइल निवडा' },
  'admin.noFile': { en: 'No file chosen', hi: 'कोई फ़ाइल नहीं चुनी गई', mr: 'कोणतीही फाइल निवडली नाही' },
  'admin.createUser': { en: 'Create User & Profile', hi: 'उपयोगकर्ता और प्रोफाइल बनाएं', mr: 'वापरकर्ता आणि प्रोफाइल तयार करा' },
  'admin.creatingUser': { en: 'Creating User...', hi: 'उपयोगकर्ता बना रहे हैं...', mr: 'वापरकर्ता तयार करत आहे...' },


  // Dropdown Options
  'gender.male': { en: 'Male', hi: 'पुरुष', mr: 'पुरुष' },
  'gender.female': { en: 'Female', hi: 'महिला', mr: 'स्त्री' },

  'marital.never': { en: 'Never Married', hi: 'कभी शादी नहीं की', mr: 'अविवाहित' },
  'marital.divorced': { en: 'Divorced', hi: 'तलाकशुदा', mr: 'घटस्फोटित' },
  'marital.widowed': { en: 'Widowed', hi: 'विधवा/विधुर', mr: 'विधवा/विधुर' },
  'marital.awaiting': { en: 'Awaiting Divorce', hi: 'तलाक की प्रतीक्षा', mr: 'घटस्पोट व्हायचा आहे' },

  'religion.hindu': { en: 'Hindu', hi: 'हिन्दू', mr: 'हिंदू' },
  'religion.muslim': { en: 'Muslim', hi: 'मुस्लिम', mr: 'मुस्लिम' },
  'religion.christian': { en: 'Christian', hi: 'ईसाई', mr: 'ख्रिश्चन' },
  'religion.sikh': { en: 'Sikh', hi: 'सिख', mr: 'शीख' },
  'religion.other': { en: 'Other', hi: 'अन्य', mr: 'इतर' },

  'rashi.mesh': { en: 'Mesha (Aries)', hi: 'मेष', mr: 'मेष' },
  'rashi.vrishabh': { en: 'Vrishabha (Taurus)', hi: 'वृषभ', mr: 'वृषभ' },
  'rashi.mithun': { en: 'Mithuna (Gemini)', hi: 'मिथुन', mr: 'मिथुन' },
  'rashi.kark': { en: 'Karka (Cancer)', hi: 'कर्क', mr: 'कर्क' },
  'rashi.simha': { en: 'Simha (Leo)', hi: 'सिंह', mr: 'सिंह' },
  'rashi.kanya': { en: 'Kanya (Virgo)', hi: 'कन्या', mr: 'कन्या' },
  'rashi.tula': { en: 'Tula (Libra)', hi: 'तुला', mr: 'तुला' },
  'rashi.vrishchik': { en: 'Vrishchika (Scorpio)', hi: 'वृश्चिक', mr: 'वृश्चिक' },
  'rashi.dhanu': { en: 'Dhanu (Sagittarius)', hi: 'धनु', mr: 'धनु' },
  'rashi.makar': { en: 'Makara (Capricorn)', hi: 'मकर', mr: 'मकर' },
  'rashi.kumbh': { en: 'Kumbha (Aquarius)', hi: 'कुंभ', mr: 'कुंभ' },
  'rashi.meen': { en: 'Meena (Pisces)', hi: 'मीन', mr: 'मीन' },

  'caste.kumbhar': { en: 'Kumbhar', hi: 'कुम्हार', mr: 'कुंभार' },
  'caste.other': { en: 'Other', hi: 'अन्य', mr: 'इतर' },

  'edu.highschool': { en: 'High School', hi: 'हाई स्कूल', mr: '१० वी - १२ वी' },
  'edu.bachelors': { en: "Bachelor's Degree", hi: "स्नातक की डिग्री", mr: "पदवी" },
  'edu.masters': { en: "Master's Degree", hi: "मास्टर डिग्री", mr: "पदव्युत्तर" },
  'edu.doctorate': { en: 'Doctorate', hi: 'डॉक्टरेट', mr: 'पीएचडी' },
  'edu.other': { en: 'Other', hi: 'अन्य', mr: 'इतर' },

  'prof.private': { en: 'Private Sector', hi: 'निजी क्षेत्र', mr: 'खाजगी नोकरी' },
  'prof.government': { en: 'Government/Public Sector', hi: 'सरकारी/सार्वजनिक क्षेत्र', mr: 'सरकारी नोकरी' },
  'prof.business': { en: 'Business/Self Employed', hi: 'व्यापार/स्व-रोजगार', mr: 'व्यवसाय' },
  'prof.defence': { en: 'Defence/Civil Services', hi: 'रक्षा/सिविल सेवा', mr: 'लष्करी सेवा' },
  'prof.farming': { en: 'Farming/Agriculture', hi: 'खेती/कृषि', mr: 'शेती' },
  'prof.notWorking': { en: 'Not Working', hi: 'काम नहीं कर रहे', mr: 'काहीही करत नाही' },
  'prof.other': { en: 'Other', hi: 'अन्य', mr: 'इतर' },
  'state.mh': { en: 'Maharashtra', hi: 'महाराष्ट्र', mr: 'महाराष्ट्र' },
  'state.ka': { en: 'Karnataka', hi: 'कर्नाटक', mr: 'कर्नाटक' },
  'state.ga': { en: 'Goa', hi: 'गोवा', mr: 'गोवा' },
  'state.gj': { en: 'Gujarat', hi: 'गुजरात', mr: 'गुजरात' },
  'state.mp': { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', mr: 'मध्य प्रदेश' },
  'state.tg': { en: 'Telangana', hi: 'तेलंगाना', mr: 'तेलंगणा' },
  'state.other': { en: 'Other', hi: 'अन्य', mr: 'इतर' },

  'city.ahmednagar': { en: 'Ahmednagar', hi: 'अहमदनगर', mr: 'अहमदनगर' },
  'city.akola': { en: 'Akola', hi: 'अकोला', mr: 'अकोला' },
  'city.amravati': { en: 'Amravati', hi: 'अमरावती', mr: 'अमरावती' },
  'city.aurangabad': { en: 'Chhatrapati Sambhajinagar', hi: 'छत्रपति संभाजीनगर', mr: 'छत्रपती संभाजीनगर' },
  'city.beed': { en: 'Beed', hi: 'बीड', mr: 'बीड' },
  'city.bhandara': { en: 'Bhandara', hi: 'भंडारा', mr: 'भंडारा' },
  'city.buldhana': { en: 'Buldhana', hi: 'बुलढाणा', mr: 'बुलढाणा' },
  'city.chandrapur': { en: 'Chandrapur', hi: 'चंद्रपुर', mr: 'चंद्रपूर' },
  'city.dhule': { en: 'Dhule', hi: 'धुले', mr: 'धुळे' },
  'city.gadchiroli': { en: 'Gadchiroli', hi: 'गढ़चिरौली', mr: 'गडचिरोली' },
  'city.gondia': { en: 'Gondia', hi: 'गोंदिया', mr: 'गोंदिया' },
  'city.hingoli': { en: 'Hingoli', hi: 'हिंगोली', mr: 'हिंगोली' },
  'city.jalgaon': { en: 'Jalgaon', hi: 'जलगांव', mr: 'जळगाव' },
  'city.jalna': { en: 'Jalna', hi: 'जालना', mr: 'जालना' },
  'city.kolhapur': { en: 'Kolhapur', hi: 'कोल्हापुर', mr: 'कोल्हापूर' },
  'city.latur': { en: 'Latur', hi: 'लातूर', mr: 'लातूर' },
  'city.mumbai': { en: 'Mumbai', hi: 'मुंबई', mr: 'मुंबई' },
  'city.nagpur': { en: 'Nagpur', hi: 'नागपुर', mr: 'नागपूर' },
  'city.nanded': { en: 'Nanded', hi: 'नांदेड़', mr: 'नांदेड' },
  'city.nandurbar': { en: 'Nandurbar', hi: 'नंदुरबार', mr: 'नंदुरबार' },
  'city.nashik': { en: 'Nashik', hi: 'नासिक', mr: 'नाशिक' },
  'city.osmanabad': { en: 'Dharashiv (Osmanabad)', hi: 'धाराशिव', mr: 'धाराशिव (उस्मानाबाद)' },
  'city.palghar': { en: 'Palghar', hi: 'पालघर', mr: 'पालघर' },
  'city.parbhani': { en: 'Parbhani', hi: 'परभणी', mr: 'परभणी' },
  'city.pune': { en: 'Pune', hi: 'पुणे', mr: 'पुणे' },
  'city.raigad': { en: 'Raigad', hi: 'रायगढ़', mr: 'रायगड' },
  'city.ratnagiri': { en: 'Ratnagiri', hi: 'रत्नागिरी', mr: 'रत्नागिरी' },
  'city.sangli': { en: 'Sangli', hi: 'सांगली', mr: 'सांगली' },
  'city.satara': { en: 'Satara', hi: 'सतारा', mr: 'सातारा' },
  'city.sindhudurg': { en: 'Sindhudurg', hi: ' सिंधुदुर्ग', mr: 'सिंधुदुर्ग' },
  'city.solapur': { en: 'Solapur', hi: 'सोलापुर', mr: 'सोलापूर' },
  'city.thane': { en: 'Thane', hi: 'ठाणे', mr: 'ठाणे' },
  'city.wardha': { en: 'Wardha', hi: 'वर्धा', mr: 'वर्धा' },
  'city.washim': { en: 'Washim', hi: 'वाशिम', mr: 'वाशिम' },
  'city.yavatmal': { en: 'Yavatmal', hi: 'यवतमाल', mr: 'यवतमाळ' },
  'city.other': { en: 'Other', hi: 'अन्य', mr: 'इतर' },
  'prof.teacher': { en: 'Teacher', hi: 'शिक्षक', mr: 'शिक्षक' },
  'prof.govServant': { en: 'Government Servant', hi: 'सरकारी नौकर', mr: 'सरकारी नोकरी' },
  'prof.farmer': { en: 'Farmer', hi: 'किसान', mr: 'शेतकरी' },
  'prof.housewife': { en: 'Housewife', hi: 'गृहिणी', mr: 'गृहिणी' },
  'register.siblingLabel': { en: 'Sibling Name', hi: 'भाई-बहन का नाम', mr: 'भावंडाचे नाव' },
  'register.siblingPlaceholder': { en: 'Enter sibling name', hi: 'भाई-बहन का नाम दर्ज करें', mr: 'भावंडाचे नाव लिहा' },

  // About Page
  'about.mission.title': { en: 'Our Mission', hi: 'हमारा मिशन', mr: 'आमचे स्वप्न' },
  'about.mission.desc': {
    en: 'ShubhVivahBandhan brings the trust and personal touch of traditional matchmaking into the digital age. We believe that marriage is a sacred bond, and finding the right partner should be a private, respectful, and dignified process.',
    hi: 'शुभविवाहबंधन पारंपरिक मैचमेकिंग के विश्वास और व्यक्तिगत स्पर्श को डिजिटल युग में लाता है। हमारा मानना है कि विवाह एक पवित्र बंधन है, और सही जीवनसाथी ढूंढना एक निजी, सम्मानजनक और गरिमापूर्ण प्रक्रिया होनी चाहिए।',
    mr: 'पारंपारिक सोयरिकीचा विश्वास आणि घरच्या माणसांसारखं लक्ष... हेच आमचं \'शुभविवाहबंधन\' आहे. लग्नासारखं पवित्र बंधन जोडताना तुमची प्रायव्हसी आणि तुमचा सन्मान राखणं, ही आमची पहिली जबाबदारी आहे. तुमच्या आयुष्याचा सोबती शोधताना तुम्हाला हक्काच्या माणसाची सोबत मिळावी, हेच आमचं ध्येय!'
  },
  'about.privacy.title': { en: 'Privacy First', hi: 'गोपनीयता पहले', mr: 'तुमची गुप्तता, आमची जबाबदारी' },
  'about.privacy.desc': {
    en: 'Unlike typical matrimonial websites where anyone can browse profiles, ShubhVivahBandhan operates on a privacy-first model. Your profile is never publicly visible. Only our trusted matchmaker reviews profiles and shares them personally with suitable matches.',
    hi: 'विवाह वेबसाइटों के विपरीत जहां कोई भी प्रोफाइल ब्राउज़ कर सकता है, शुभविवाहबंधन गोपनीयता-प्रथम मॉडल पर काम करता है। आपकी प्रोफाइल कभी भी सार्वजनिक रूप से दिखाई नहीं देती है। केवल हमारा विश्वसनीय मैचमेकर प्रोफाइल की समीक्षा करता है और उन्हें उपयुक्त मैचों के साथ व्यक्तिगत रूप से साझा करता है।',
    mr: 'इतर वेबसाईटसारखं तुमची माहिती इथे उघड्यावर कोणालाही दिसणार नाही. \'शुभविवाहबंधन\'मध्ये आम्ही तुमच्या खाजगीपणाला देवासारखं जपतो. तुमचं प्रोफाईल कधीही सार्वजनिक केलं जात नाही. फक्त आमचे विश्वासू प्रतिनिधीच तुमची माहिती पाहू शकतात आणि ती केवळ योग्य कुटुंबांपर्यंतच वैयक्तिकरित्या पोहोचवली जाते.'
  },
  'about.community.title': { en: 'Community Driven', hi: 'समुदाय संचालित', mr: 'समाज सेवा' },
  'about.community.desc': {
    en: 'We are a community service dedicated to helping families find suitable matches. Profile submission is completely free. Our approach is personal - we understand that every family is unique, and we treat each profile with care and respect.',
    hi: 'हम परिवारों को उपयुक्त मैच खोजने में मदद करने के लिए समर्पित एक सामुदायिक सेवा हैं। प्रोफाइल सबमिशन पूरी तरह से मुफ्त है। हमारा दृष्टिकोण व्यक्तिगत है - हम समझते हैं कि प्रत्येक परिवार अद्वितीय है, और हम प्रत्येक प्रोफाइल को देखभाल और सम्मान के साथ मानते हैं।',
    mr: 'आम्ही केवळ एक वेबसाईट नसून, आपल्या कुटुंबांना हक्काची सोयरिक मिळवून देणारी एक \'समाज सेवा\' आहोत. इथे नाव नोंदणीसाठी एक रुपयाही घेतला जात नाही. आम्हाला माहित आहे की प्रत्येक कुटुंब खास असतं, म्हणूनच आम्ही प्रत्येक प्रोफाईलकडं यंत्रासारखं नाही, तर घरच्या माणसासारखं आपुलकीने आणि आदराने बघतो.'
  },
  'about.verified.title': { en: 'Verified & Trusted', hi: 'सत्यापित और विश्वसनीय', mr: 'खात्री आणि विश्वास' },
  'about.verified.desc': {
    en: 'Every profile goes through our verification process. We ensure authenticity and maintain the highest standards of trust. Our success stories speak for themselves - hundreds of happy marriages built on the foundation of trust and tradition.',
    hi: 'प्रत्येक प्रोफाइल हमारी सत्यापन प्रक्रिया से गुजरती है। हम प्रामाणिकता सुनिश्चित करते हैं और विश्वास के उच्चतम मानकों को बनाए रखते हैं। हमारी सफलता की कहानियां खुद बोलती हैं - विश्वास और परंपरा की नींव पर बनी सैकड़ों खुशहाल शादियां।',
    mr: 'आम्ही माहिती जमा करून ती तुमच्यासमोर मांडतो. नातं जोडण्यापूर्वी माहितीची स्वतःकडून शहानिशा करून घेणं सोयीचं ठरेल, जेणेकरून तुमचा पुढचा प्रवास सुखकर होईल.'
  },

  'family.nuclear': { en: 'Nuclear', hi: 'एकल', mr: 'विभक्त' },
  'family.joint': { en: 'Joint', hi: 'संयुक्त', mr: 'एकत्र' },
  'family.father': { en: 'Father', hi: 'पिता', mr: 'वडील' },
  'family.mother': { en: 'Mother', hi: 'माता', mr: 'आई' },
  'family.siblings': { en: 'Siblings', hi: 'भाई-बहन', mr: 'भावंडे' },
  'family.siblingsCount': { en: 'Number of Siblings', hi: 'भाई-बहनों की संख्या', mr: 'भावंडांची संख्या' },
  // Terms & Conditions
  'terms.title': { en: 'Terms and Conditions', hi: 'नियम और शर्तें', mr: 'नियम आणि अटी' },
  'terms.serviceNature.title': { en: '1. Nature of Service', hi: '1. सेवा का स्वरूप', mr: '१. सेवेचे स्वरूप' },
  'terms.serviceNature.desc': {
    en: 'This platform is intended solely for connecting brides, grooms, and their families. We do not guarantee marriage or finding a partner.',
    hi: 'यह मंच केवल वधू, वर और उनके परिवारों को जोड़ने के लिए है। हम शादी या साथी मिलने की गारंटी नहीं देते हैं।',
    mr: 'हे प्लॅटफॉर्म फक्त उपवर-वधू आणि त्यांच्या परिवाराची गाठ घालून देण्यासाठी आहे. लग्न होईलच किंवा जोडीदार पटेलच, याची आम्ही खात्री (गॅरंटी) देत नाही.'
  },
  'terms.profileReg.title': { en: '2. Profile Registration', hi: '2. प्रोफाइल पंजीकरण', mr: '२. प्रोफाईल नोंदणी' },
  'terms.profileReg.desc': {
    en: 'Registration or profile creation is completely free. However, it is your responsibility to ensure all information provided is true and accurate.',
    hi: 'पंजीकरण या प्रोफाइल बनाना पूरी तरह से मुफ्त है। हालांकि, यह आपकी जिम्मेदारी है कि प्रदान की गई सभी जानकारी सत्य और सटीक हो।',
    mr: 'नांव नोंदणी किंवा प्रोफाईल देणे एकदम मोफत आहे. पण, प्रोफाईलमध्ये दिलेली सर्व माहिती खरी आणि अचूक असावी, ही तुमची जबाबदारी आहे.'
  },
  'terms.infoSharing.title': { en: '3. Information Sharing', hi: '3. जानकारी साझा करना', mr: '३. माहिती शेअर करणे' },
  'terms.infoSharing.desc': {
    en: 'We will verify your information and show it to suitable matches only with your consent.',
    hi: 'हम आपकी जानकारी का सत्यापन करेंगे और आपकी सहमति से ही इसे उपयुक्त मैचों को दिखाएंगे।',
    mr: 'तुमची माहिती आम्ही तपासून पाहू आणि तुमच्या संमतीनेच (परवानगीनेच) योग्य अशा स्थळांना दाखवू.'
  },
  'terms.adminRights.title': { en: '4. Admin Rights', hi: '4. एडमिन के अधिकार', mr: '४. ॲडमिनचे अधिकार' },
  'terms.adminRights.desc': {
    en: 'The Admin retains all rights regarding which profiles to keep or remove, whom to show information to, and how to operate this process.',
    hi: 'किस प्रोफाइल को रखना या हटाना है, किसे जानकारी दिखानी है और इस प्रक्रिया को कैसे संचालित करना है, इसके सभी अधिकार एडमिन के पास सुरक्षित हैं।',
    mr: 'कोणते प्रोफाईल ठेवायचे किंवा काढून टाकायंचे, कोणाला माहिती दाखवायची आणि ही सर्व प्रक्रिया कशी चालवायची, याचे सर्व अधिकार ॲडमिनकडे राहतील.'
  },
  'terms.fees.title': { en: '5. Fees (If Applicable)', hi: '5. शुल्क (यदि लागू हो)', mr: '५. पैसे किंवा फी (लागू असल्यास)' },
  'terms.fees.desc': {
    en: 'If any fee is applicable for a service, you will be told clearly in advance. Fees once paid for services rendered are non-refundable.',
    hi: 'यदि किसी सेवा के लिए शुल्क लागू है, तो आपको पहले ही स्पष्ट रूप से बताया जाएगा। एक बार सेवा प्रदान करने के बाद भुगतान किया गया शुल्क वापस नहीं किया जाएगा।',
    mr: 'जर काही कामासाठी फी लागणार असेल, तर ती तुम्हाला आधीच स्पष्टपणे सांगितली जाईल. एकदा सेवा दिल्यानंतर दिलेले पैसे परत (Refund) मिळणार नाहीत.'
  },
  'terms.userResp.title': { en: '6. User Responsibility', hi: '6. उपयोगकर्ता की जिम्मेदारी', mr: '६. वापरकर्त्याची जबाबदारी' },
  'terms.userResp.desc': {
    en: 'Treat the other person and their family with respect. Do not misuse any information or phone numbers obtained.',
    hi: 'दूसरे व्यक्ति और उनके परिवार के साथ सम्मान से पेश आएं। प्राप्त किसी भी जानकारी या फोन नंबर का दुरुपयोग न करें।',
    mr: 'समोरच्या व्यक्तीशी किंवा परिवाराशी आदराने वागावे. मिळालेल्या माहितीचा किंवा फोन नंबरचा कोणताही गैरवापर करू नये.'
  },
  'terms.accountClosure.title': { en: '7. Account Closure', hi: '7. खाता बंद करना', mr: '७. खाते बंद करणे' },
  'terms.accountClosure.desc': {
    en: 'If anyone violates the rules or misuses information, the Admin can close their account without prior notice.',
    hi: 'यदि कोई नियमों का उल्लंघन करता है या जानकारी का दुरुपयोग करता है, तो एडमिन बिना किसी पूर्व सूचना के उसका खाता बंद कर सकता है।',
    mr: 'जर कोणी नियमांचे उल्लंघन केले किंवा माहितीचा चुकीचा वापर केला, तर ॲडमिन त्याचे खाते (Account) कोणत्याही पूर्वसूचनेशिवाय बंद करू शकतात.'
  },

  // Privacy Policy
  'privacy.title': { en: 'Privacy Policy', hi: 'गोपनीयता नीति', mr: 'गोपनीयता धोरण' },
  'privacy.dataCollection.title': { en: '1. Data Collection', hi: '1. डेटा संग्रह', mr: '१. माहिती गोळा करणे' },
  'privacy.dataCollection.desc': {
    en: 'We only collect information that is necessary to find a suitable partner. We do not ask for unnecessary extra information.',
    hi: 'हम केवल वही जानकारी एकत्र करते हैं जो उपयुक्त जीवनसाथी खोजने के लिए आवश्यक है। हम अनावश्यक अतिरिक्त जानकारी नहीं मांगते हैं।',
    mr: 'आम्ही फक्त तेवढीच माहिती घेतो जी योग्य जोडीदार शोधण्यासाठी गरजेची आहे. उगाच अवांतर माहिती विचारली जात नाही.'
  },
  'privacy.dataUsage.title': { en: '2. Data Usage', hi: '2. डेटा का उपयोग', mr: '२. माहितीचा वापर' },
  'privacy.dataUsage.desc': {
    en: 'Your information will only be used for matrimonial purposes. It will not be published anywhere or sold to anyone.',
    hi: 'आपकी जानकारी का उपयोग केवल वैवाहिक उद्देश्यों के लिए किया जाएगा। इसे कहीं भी प्रकाशित नहीं किया जाएगा और न ही किसी को बेचा जाएगा।',
    mr: 'तुमची माहिती फक्त लग्नाच्या कामासाठीच वापरली जाईल. ती कुठेही जाहीर केली जाणार नाही किंवा कोणालाही विकली जाणार नाही.'
  },
  'privacy.visibility.title': { en: '3. Who can see what?', hi: '3. कौन क्या देख सकता है?', mr: '३. कोणाला काय दिसेल?' },
  'privacy.visibility.desc': {
    en: 'Your full information can only be seen by the \'Admin\'. Others will only be shown limited information as needed.',
    hi: 'आपकी पूरी जानकारी केवल \'एडमिन\' ही देख सकता है। अन्य लोगों को केवल आवश्यकतानुसार सीमित जानकारी दिखाई जाएगी।',
    mr: 'तुमची पूर्ण माहिती फक्त \'ॲडमिन\'लाच (Admin) पाहता येईल. इतर लोकांना फक्त कामापुरती आणि मर्यादित माहितीच दाखवली जाईल.'
  },
  'privacy.security.title': { en: '4. Photo and Number Security', hi: '4. फोटो और नंबर सुरक्षा', mr: '४. फोटो आणि फोन नंबरची सुरक्षा' },
  'privacy.security.desc': {
    en: 'Your photos and mobile numbers will be kept secure. They will not be given to anyone without your permission.',
    hi: 'आपके फोटो और मोबाइल नंबर सुरक्षित रखे जाएंगे। आपकी अनुमति के बिना वे किसी को नहीं दिए जाएंगे।',
    mr: 'तुमचे फोटो आणि मोबाईल नंबर सुरक्षित ठेवले जातील. तुमच्या परवानगीशिवाय ते कोणालाही दिले जाणार नाहीत.'
  },
  'privacy.system.title': { en: '5. Secure System', hi: '5. सुरक्षित प्रणाली', mr: '५. सुरक्षित यंत्रणा' },
  'privacy.system.desc': {
    en: 'We use a special security system to keep your information safe so that it is not stolen.',
    hi: 'हम आपकी जानकारी को सुरक्षित रखने के लिए एक विशेष सुरक्षा प्रणाली का उपयोग करते हैं ताकि यह चोरी न हो।',
    mr: 'तुमची माहिती सुरक्षित राहावी म्हणून आम्ही खास सिक्युरिटी सिस्टीम वापरतो, जेणेकरून माहितीची चोरी होणार नाही.'
  },
  'privacy.deletion.title': { en: '6. Profile Deletion', hi: '6. प्रोफाइल हटाना', mr: '६. प्रोफाईल काढून टाकणे' },
  'privacy.deletion.desc': {
    en: 'If you feel you want to remove your name, you can tell the Admin at any time to delete your information.',
    hi: 'यदि आपको लगता है कि आप अपना नाम हटाना चाहते हैं, तो आप किसी भी समय एडमिन को अपनी जानकारी हटाने के लिए कह सकते हैं।',
    mr: 'तुम्हाला वाटलं की आता आपलं नाव यातून काढून टाकायचं आहे, तर तुम्ही कधीही ॲडमिनला सांगून तुमची माहिती डिलीट करून घेऊ शकता.'
  },
  'family.brother': { en: 'Brothers', hi: 'भाई', mr: 'भाऊ' },
  'family.sister': { en: 'Sisters', hi: 'बहनें', mr: 'बहिणी' },
  'family.type_label': { en: 'Family Type', hi: 'परिवार का प्रकार', mr: 'कुटुंब प्रकार' },
  'profile.contactHidden': { en: 'Sensitive information is hidden for privacy.', hi: 'गोपनीयता के लिए संवेदनशील जानकारी छिपी हुई है।', mr: 'गोपनीयतेसाठी संवेदनशील माहिती लपवलेली आहे.' },
  'profile.contactAdmin': {
    en: 'To view contact details, please contact Admin: Vaibhav Nimbalkar 8010246840',
    hi: 'संपर्क विवरण देखने के लिए, कृपया एडमिन से संपर्क करें: वैभव निंबालकर 8010246840',
    mr: "जास्त माहिती हवी असल्यास 'शुभविवाहबंधन' टीमला कॉन्टॅक्ट करा. तुमच्या मनातल्या सगळ्या प्रश्नांची उत्तरं तुम्हाला मिळतील. (वैभव निंबाळकर: 8010246840)"
  },
  'public.loginRequired': { en: 'Login Required', hi: 'लॉगिन आवश्यक', mr: 'लॉगिन करणे आवश्यक आहे' },
  'public.loginRequiredDesc': {
    en: 'You must create an account or login to view full profiles.',
    hi: 'पूर्ण प्रोफाइल देखने के लिए आपको खाता बनाना होगा या लॉगिन करना होगा।',
    mr: 'प्रोफाईल पाहण्यासाठी तुम्हाला खाते तयार करावे लागेल किंवा लॉगिन करावे लागेल.'
  },
  'contact.loginRequired': { en: 'Login Required', hi: 'लॉगिन आवश्यक', mr: 'लॉगिन आवश्यक' },
  'contact.loginMsg': { en: 'Please login to send a message.', hi: 'संदेश भेजने के लिए कृपया लॉगिन करें।', mr: 'संदेश पाठवण्यासाठी कृपया लॉगिन करा.' },



  'toast.successLine': { en: 'Operation successful.', hi: 'ऑपरेशन सफल रहा।', mr: 'प्रक्रिया यशस्वी झाली.' },
  'toast.errorLine': { en: 'Something went wrong.', hi: 'कुछ गलत हो गया।', mr: 'काहीतरी चूक झाली.' },
  'toast.profileDeleted': { en: 'Profile deleted successfully.', hi: 'प्रोफाइल सफलतापूर्वक हटा दी गई।', mr: 'प्रोफाइल यशस्वीरित्या हटवली.' },
  'toast.profileDeleteError': { en: 'Failed to delete profile.', hi: 'प्रोफाइल हटाने में विफल।', mr: 'प्रोफाइल हटवण्यात अपयश.' },
  'toast.profileUpdated': { en: 'Profile updated successfully.', hi: 'प्रोफाइल सफलतापूर्वक अपडेट की गई।', mr: 'प्रोफाइल यशस्वीरित्या अपडेट केली.' },
  'toast.profileLoadError': { en: 'Failed to load profile data.', hi: 'प्रोफाइल डेटा लोड करने में विफल।', mr: 'प्रोफाइल माहिती लोड करण्यात अपयश.' },

  'toast.storyRemoved': { en: 'The story and its photo have been permanently removed.', hi: 'कहानी और उसकी तस्वीर को स्थायी रूप से हटा दिया गया है।', mr: 'गोष्ट आणि फोटो कायमचे काढून टाकले आहेत.' },
  'toast.storyAdded': { en: 'Success story added!', hi: 'सफलता की कहानी जोड़ी गई!', mr: 'यशस्वी कहाणी जोडली!' },
  'toast.photoUpdated': { en: 'Story photo has been updated.', hi: 'कहानी की फोटो अपडेट कर दी गई है।', mr: 'कहाणीचा फोटो अपडेट केला आहे.' },
  'toast.demoDataLoaded': { en: 'Sample success stories have been added.', hi: 'नमूना सफलता की कहानियां जोड़ी गई हैं।', mr: 'नमुना यशस्वी कहाण्या जोडल्या आहेत.' },

  'toast.msgSent': { en: 'Message Sent', hi: 'संदेश भेजा गया', mr: 'संदेश पाठवला' },
  'toast.msgSentDesc': { en: 'We will contact you shortly.', hi: 'हम आपसे जल्द ही संपर्क करेंगे।', mr: 'आम्ही लवकरच आपल्याशी संपर्क साधू.' },
  'toast.msgFailed': { en: 'Failed to send message.', hi: 'संदेश भेजने में विफल।', mr: 'संदेश पाठवण्यात अपयश.' },
  'contact.loginRequiredDesc': { en: 'Please login to send a message.', hi: 'संदेश भेजने के लिए कृपया लॉगिन करें।', mr: 'संदेश पाठवण्यासाठी कृपया लॉगिन करा.' },

  // Contact Page
  'contact.getInTouch': { en: 'Get in Touch', hi: 'संपर्क करें', mr: 'मार्गदर्शनासाठी संपर्क' },
  'contact.desc': {
    en: "Have questions? We're here to help you on your journey to find the perfect match.",
    hi: 'प्रश्न हैं? हम आपकी पूर्ण जोड़ी खोजने की यात्रा में मदद करने के लिए यहाँ हैं।',
    mr: 'आम्ही तुमच्या मदतीला आहोत! योग्य जोडीदार शोधण्याचा हा प्रवास महत्त्वाचा आहे. या प्रवासात तुम्हाला मार्गदर्शन करण्यासाठी आणि तुमच्या प्रश्नांची उत्तरं देण्यासाठी आमची टीम नेहमीच तयार आहे.'
  },
  'contact.sendMessage': { en: 'Send a Message', hi: 'संदेश भेजें', mr: 'संदेश पाठवा' },
  'contact.name': { en: 'Your Name', hi: 'आपका नाम', mr: 'तुमचे नाव' },
  'contact.email': { en: 'Your Email', hi: 'आपका ईमेल', mr: 'तुमचा ईमेल' },
  'contact.subject': { en: 'Subject', hi: 'विषय', mr: 'विषय' },
  'contact.message': { en: 'Message', hi: 'संदेश', mr: 'संदेश' },
  'contact.submit': { en: 'Send Message', hi: 'संदेश भेजें', mr: 'संदेश पाठवा' },
  'contact.sending': { en: 'Sending...', hi: 'भेज रहा है...', mr: 'पाठवत आहे...' },
  'contact.success': { en: 'Message Sent', hi: 'संदेश भेजा गया', mr: 'संदेश पाठविला' },
  'contact.successDesc': { en: "We've received your message and will get back to you soon.", hi: 'हमें आपका संदेश प्राप्त हुआ है और हम जल्द ही आपसे संपर्क करेंगे।', mr: 'आम्हाला तुमचा संदेश मिळाला आहे आणि आम्ही लवकरच तुमच्याशी संपर्क साधू.' },

  // Contact Info
  'contact.info.email': { en: 'Email', hi: 'ईमेल', mr: 'ईमेल' },
  'contact.info.phone': { en: 'Phone', hi: 'फोन', mr: 'फोन' },
  'contact.info.address': { en: 'Address', hi: 'पता', mr: 'पत्ता' },
  'contact.addressValue': { en: 'Beed, Maharashtra, India', hi: 'बीड, महाराष्ट्र, भारत', mr: 'बीड, महाराष्ट्र, भारत' },

  // Success Stories

  'success.story1': { en: 'We were matched by ShubhVivahBandhan and knew from the first meeting that we were meant for each other. Thank you for bringing us together!', hi: 'हमारा मिलन शुभविवाहबंधन द्वारा कराया गया था और पहली मुलाकात से ही हम जानते थे कि हम एक-दूसरे के लिए बने हैं। हमें साथ लाने के लिए धन्यवाद!', mr: 'आजच्या धावपळीच्या जगात योग्य माणसं भेटणं कठीण झालंय. पण तुमची पद्धत इतकी वैयक्तिक आणि छान आहे की, आम्हाला अजिबात दडपण आलं नाही. अगदी सहजपणे आमचं बोलणं झालं, भेटी झाल्या आणि आज आम्ही एक झालो आहोत. \'शुभविवाहबंधन\'ची साथ हीच आमची ताकद ठरली!' },
  'success.story2': { en: 'The personalized approach made all the difference. Our families connected instantly, and we are now happily married.', hi: 'व्यक्तिगत दृष्टिकोण ने सारा अंतर पैदा किया। हमारे परिवार तुरंत जुड़ गए, और अब हम खुशी से विवाहित हैं।', mr: 'केवळ दोन व्यक्तींची नाही, तर आमच्या दोन कुटुंबांची मनं जुळली, आणि हे फक्त \'शुभविवाहबंधन\'च्या वैयक्तिक लक्षामुळेच शक्य झालं. आज आम्ही एका सुखी संसाराची सुरुवात केली आहे आणि खूप आनंदी आहोत!' },
  'success.story3': { en: 'Privacy was our biggest concern, and ShubhVivahBandhan handled everything with utmost care. Forever grateful!', hi: 'गोपनीयता हमारी सबसे बड़ी चिंता थी, और शुभविवाहबंधन ने सब कुछ अत्यधिक देखभाल के साथ संभाला। हमेशा आभारी रहेंगे!', mr: 'लग्नाच्या बाबतीत माहितीची गुप्तता पाळणं ही आमची पहिली अट होती. \'शुभविवाहबंधन\'ने आमचा हा विश्वास सार्थ ठरवला आणि सर्व काही खूप काळजीपूर्वक सांभाळलं. योग्य सोबती मिळवून दिल्याबद्दल आम्ही तुमचे कायम ऋणी राहू!' },
  'success.cta.text': { en: 'Your story could be next!', hi: 'आपकी कहानी अगली हो सकती है!', mr: 'तुमची सुखी संसाराची गोष्ट उद्या इथे असू शकते!' },
  'success.cta.button': { en: 'Register Profile Today', hi: 'आज ही प्रोफाइल रजिस्टर करें', mr: 'आजच आपलं स्थळ नोंदवा' },
  'success.form.title': { en: 'Add Success Story', hi: 'सफलता की कहानी जोड़ें', mr: 'यशोगाथा जोडा' },
  'success.form.names': { en: 'Couple Names', hi: 'युगल नाम', mr: 'जोडप्याचे नाव' },
  'success.form.year': { en: 'Year', hi: 'वर्ष', mr: 'वर्ष' },
  'success.form.story': { en: 'Story', hi: 'कहानी', mr: 'माहिती' },
  'success.form.photo': { en: 'Photo', hi: 'तस्वीर', mr: 'फोटो' },
  'success.form.add': { en: 'Add Story', hi: 'कहानी जोड़ें', mr: 'माहिती जोडा' },
  'success.form.choose': { en: 'Choose File', hi: 'फ़ाइल चुनें', mr: 'फाइल निवडा' },
  'success.demo.load': { en: 'Load Demo Data', hi: 'डेमो डेटा लोड करें', mr: 'डेमो डेटा लोड करा' },
  'success.noStories': { en: 'No success stories yet', hi: 'अभी तक कोई सफलता की कहानियां नहीं', mr: 'अद्याप यशोगाथा उपलब्ध नाहीत' },
  'success.uploadFailed': { en: 'Image upload failed', hi: 'छवि अपलोड विफल', mr: 'फोटो अपलोड होऊ शकला नाही' },
  'success.bucketMissing': { en: 'Storage bucket "success-stories" not found. Please create it in Supabase.', hi: 'स्टोरेज बकेट "success-stories" नहीं मिली। कृपया इसे Supabase में बनाएं।', mr: 'स्टोरेज बकेट "success-stories" सापडली नाही. कृपया ती Supabase मध्ये तयार करा.' },
  'success.storyAdded': { en: 'Story added successfully!', hi: 'कहानी सफलतापूर्वक जोड़ी गई!', mr: 'यशोगाथा यशस्वीरित्या जोडली गेली!' },
  'success.missingFields': { en: 'Please fill all fields and select an image.', hi: 'कृपया सभी फ़ील्ड भरें और एक छवि चुनें।', mr: 'कृपया सर्व माहिती भरा आणि फोटो निवडा.' },

  // Payment Info
  'payment.title': { en: 'Premium Membership Required', hi: 'प्रीमियम सदस्यता आवश्यक', mr: 'प्रीमियम मेंबरशिप आवश्यक' },
  'payment.desc': {
    en: 'To send match requests, you need to upgrade to a **Premium Membership**. This helps us maintain a verified and serious community.',
    hi: 'मैच अनुरोध भेजने के लिए, आपको **प्रीमियम सदस्यता** में अपग्रेड करना होगा। यह हमें एक सत्यापित और गंभीर समुदाय बनाए रखने में मदद करता है।',
    mr: "स्वप्न बघून नाही, तर 'योग्य निर्णयाने' पूर्ण होतात! आमची प्रीमियम साथ घ्या आणि आयुष्याची नवी सुरुवात करा"
  },
  'payment.howTo': { en: 'How to Upgrade', hi: 'अपग्रेड कैसे करें', mr: 'अपग्रेड कसं करायचं? (फक्त ३ सोप्या पायऱ्या!)' },
  'payment.step1.title': { en: 'Step 1: Contact Admin', hi: 'चरण 1: एडमिन से संपर्क करें', mr: 'पायरी १: आमच्याशी बोला' },
  'payment.step1.desc': { en: 'Call or message us to request an upgrade.', hi: 'अपग्रेड का अनुरोध करने के लिए हमें कॉल या संदेश भेजें।', mr: "तुमची मेंबरशिप वाढवण्यासाठी आम्हाला फक्त एक 'कॉल' किंवा 'व्हॉट्सॲप मेसेज' करा. आम्ही तुमच्या मदतीसाठी सदैव तयार आहोत!" },
  'payment.step2.title': { en: 'Step 2: Make Payment', hi: 'चरण 2: भुगतान करें', mr: 'पायरी २: सोपे पेमेंट' },
  'payment.step2.desc': { en: 'Pay the membership fee via Cash or UPI.', hi: 'नकद या UPI के माध्यम से सदस्यता शुल्क का भुगतान करें।', mr: 'तुमची मेंबरशिप फी तुम्ही रोख (Cash) किंवा कोणत्याही UPI (Google Pay, PhonePe) द्वारे अगदी सहज भरू शकता.' },
  'payment.step3.title': { en: 'Step 3: Get Verified', hi: 'चरण 3: सत्यापित हो जाएं', mr: 'पायरी ३: प्रवास सुरू करा!' },
  'payment.step3.desc': { en: 'We will instantly upgrade your account to Premium, and you can start sending requests!', hi: 'हम आपके खाते को तुरंत प्रीमियम में अपग्रेड कर देंगे, और आप अनुरोध भेजना शुरू कर सकते हैं!', mr: "पेमेंट होताच आम्ही तुमचं खातं 'प्रीमियम' करू. त्यानंतर लगेच तुम्ही तुमच्या आवडत्या स्थळांना विनंत्या पाठवायला सुरुवात करू शकता!" },
  'payment.goBack': { en: 'Go Back', hi: 'पीछे जाएं', mr: 'मागे जा' },
  'payment.contactNow': { en: 'Contact Us Now', hi: 'अभी संपर्क करें', mr: 'संसाराच्या पहिल्या पाऊलासाठी, आत्ताच संपर्क साधा!' },
  'payment.alert.title': { en: 'Premium Required', hi: 'प्रीमियम आवश्यक', mr: 'प्रीमियम मेंबरशिप आवश्यक' },
  'payment.alert.desc': {
    en: 'You need a premium membership to request matches.',
    hi: 'मैच अनुरोध करने के लिए आपको प्रीमियम सदस्यता की आवश्यकता है।',
    mr: 'आजच घ्या प्रीमियम सदस्य व्हा आणि तुमच्या आवडीच्या स्थळांना विनंती पाठवून संसाराचा प्रवास सुरू करा.'
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('vivahbandhan-language');
    return (saved as Language) || 'mr';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('vivahbandhan-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
