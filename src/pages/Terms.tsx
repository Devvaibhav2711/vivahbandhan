import React from 'react';
import Layout from '@/components/layout/Layout';

const Terms: React.FC = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-4 text-center">नियम आणि अटी</h1>
            <div className="section-divider mb-8" />

            <div className="card-elegant p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold mb-2">१. सेवेचे स्वरूप</h2>
                <p className="text-muted-foreground">हे प्लॅटफॉर्म फक्त उपवर-वधू आणि त्यांच्या परिवाराची गाठ घालून देण्यासाठी आहे. लग्न होईलच किंवा जोडीदार पटेलच, याची आम्ही खात्री (गॅरंटी) देत नाही.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">२. प्रोफाईल नोंदणी</h2>
                <p className="text-muted-foreground">नांव नोंदणी किंवा प्रोफाईल देणे एकदम मोफत आहे. पण, प्रोफाईलमध्ये दिलेली सर्व माहिती खरी आणि अचूक असावी, ही तुमची जबाबदारी आहे.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">३. माहिती शेअर करणे</h2>
                <p className="text-muted-foreground">तुमची माहिती आम्ही तपासून पाहू आणि तुमच्या संमतीनेच (परवानगीनेच) योग्य अशा स्थळांना दाखवू.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">४. ॲडमिनचे अधिकार</h2>
                <p className="text-muted-foreground">कोणते प्रोफाईल ठेवायचे किंवा काढून टाकायचे, कोणाला माहिती दाखवायची आणि ही सर्व प्रक्रिया कशी चालवायची, याचे सर्व अधिकार ॲडमिनकडे राहतील.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">५. पैसे किंवा फी (लागू असल्यास)</h2>
                <p className="text-muted-foreground">जर काही कामासाठी फी लागणार असेल, तर ती तुम्हाला आधीच स्पष्टपणे सांगितली जाईल. एकदा सेवा दिल्यानंतर दिलेले पैसे परत (Refund) मिळणार नाहीत.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">६. वापरकर्त्याची जबाबदारी</h2>
                <p className="text-muted-foreground">समोरच्या व्यक्तीशी किंवा परिवाराशी आदराने वागावे. मिळालेल्या माहितीचा किंवा फोन नंबरचा कोणताही गैरवापर करू नये.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">७. खाते बंद करणे</h2>
                <p className="text-muted-foreground">जर कोणी नियमांचे उल्लंघन केले किंवा माहितीचा चुकीचा वापर केला, तर ॲडमिन त्याचे खाते (Account) कोणत्याही पूर्वसूचनेशिवाय बंद करू शकतात.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
