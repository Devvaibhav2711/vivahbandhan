import React from 'react';
import Layout from '@/components/layout/Layout';

const Privacy: React.FC = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-4 text-center">गोपनीयता धोरण</h1>
            <div className="section-divider mb-8" />

            <div className="card-elegant p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold mb-2">१. माहिती गोळा करणे</h2>
                <p className="text-muted-foreground">आम्ही फक्त तेवढीच माहिती घेतो जी योग्य जोडीदार शोधण्यासाठी गरजेची आहे. उगाच अवांतर माहिती विचारली जात नाही.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">२. माहितीचा वापर</h2>
                <p className="text-muted-foreground">तुमची माहिती फक्त लग्नाच्या कामासाठीच वापरली जाईल. ती कुठेही जाहीर केली जाणार नाही किंवा कोणालाही विकली जाणार नाही.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">३. कोणाला काय दिसेल?</h2>
                <p className="text-muted-foreground">तुमची पूर्ण माहिती फक्त 'ॲडमिन'लाच (Admin) पाहता येईल. इतर लोकांना फक्त कामापुरती आणि मर्यादित माहितीच दाखवली जाईल.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">४. फोटो आणि फोन नंबरची सुरक्षा</h2>
                <p className="text-muted-foreground">तुमचे फोटो आणि मोबाईल नंबर सुरक्षित ठेवले जातील. तुमच्या परवानगीशिवाय ते कोणालाही दिले जाणार नाहीत.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">५. सुरक्षित यंत्रणा</h2>
                <p className="text-muted-foreground">तुमची माहिती सुरक्षित राहावी म्हणून आम्ही खास सिक्युरिटी सिस्टीम वापरतो, जेणेकरून माहितीची चोरी होणार नाही.</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">६. प्रोफाईल काढून टाकणे</h2>
                <p className="text-muted-foreground">तुम्हाला वाटलं की आता आपलं नाव यातून काढून टाकायचं आहे, तर तुम्ही कधीही ॲडमिनला सांगून तुमची माहिती डिलीट करून घेऊ शकता.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
