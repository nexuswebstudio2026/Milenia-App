import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: '¿Necesito comprar computadores o equipos costosos?',
      answer: 'No. Milenia es 100% multidispositivo y opera en la nube. Tus meseros pueden usar sus propios celulares (Android o iPhone), puedes colocar tablets económicas de 8 o 10 pulgadas en cocina para el KDS, y usar cualquier computador portátil o torre con Windows, Mac o Linux en caja.'
    },
    {
      question: '¿Cómo funciona la Facturación Electrónica DIAN y el Impoconsumo del 8%?',
      answer: 'Milenia se conecta directamente con los servicios web de la DIAN para emitir facturas electrónicas con código CUFE y QR reglamentario. Si tu restaurante pertenece al Régimen Simple o tributa Impoconsumo (8% según la Ley 2277), el sistema calcula automáticamente la base y el impuesto, emitiendo además el informe Z diario para tu contador.'
    },
    {
      question: '¿Qué sucede si se corta el internet durante el servicio del restaurante?',
      answer: 'Milenia cuenta con almacenamiento en caché y modo offline local. Si se interrumpe la conexión, tus meseros pueden seguir abriendo mesas y tomando pedidos en la red interna. En cuanto el servicio de internet se restablece, el sistema sincroniza todo automáticamente sin pérdida de información.'
    },
    {
      question: '¿Cuánto tiempo toma capacitar a mi equipo y ponerlo a funcionar?',
      answer: 'La mayoría de restaurantes en Colombia empiezan a operar en menos de 24 horas. La interfaz es tan intuitiva que un mesero nuevo aprende a comandar en solo 10 a 15 minutos. Además, nuestro equipo de soporte te ayuda a subir tu carta y configurar tus impresoras térmicas.'
    },
    {
      question: '¿Puedo cargar mi menú y lista de precios desde un archivo de Excel?',
      answer: 'Sí. Puedes enviarnos tu lista actual o subirla tú mismo a través de nuestra plantilla Excel. Se cargarán categorías, precios, variantes (términos de carne, adiciones) e ingredientes en minutos.'
    },
    {
      question: '¿Tienen cláusula de permanencia o contratos de amarre?',
      answer: 'Absolutamente ninguna. En los planes mensuales puedes cancelar cuando desees sin penalidades. Confiamos en nuestro producto: si Milenia no te genera valor y tranquilidad, eres libre de marcharte en cualquier momento.'
    }
  ];

  return (
    <section id="faq" className="py-20 lg:py-28 bg-slate-950 text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Respuestas Claras</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Preguntas frecuentes sobre Milenia
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Resolvemos las dudas más comunes de dueños y administradores de restaurantes en Colombia.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-amber-300 transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <div className={`w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-amber-500 text-slate-950' : 'text-slate-400'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
