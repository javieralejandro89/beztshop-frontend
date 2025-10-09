// src/app/privacy/page.tsx - Política de Privacidad México/US - Dark Tech Theme
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <div className="mb-6">
          <Link 
            href="/auth/login"
            className="inline-flex items-center text-gray-400 hover:text-[#FFD700] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Link>
        </div>
        <div className="bg-[#1F1F1F]/90 backdrop-blur-sm border border-[#FFD700]/20 rounded-lg shadow-glow-gold p-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            Aviso de Privacidad
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-400 mb-8">
              <strong className="text-[#FFD700]">Última actualización:</strong> {new Date().toLocaleDateString('es-MX', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Identidad y Domicilio del Responsable</h2>
              <div className="bg-gradient-to-r from-[#00C8FF]/10 to-[#FFD700]/10 border border-[#00C8FF]/20 p-4 rounded-lg mb-4">
                <p className="text-white mb-2"><strong>BeztShop</strong></p>
                <p className="text-gray-300">Domicilio: Ciudad de México, CDMX, México</p>
                <p className="text-gray-300">Correo electrónico: atencionalcliente@beztshop.com</p>
                <p className="text-gray-300">Sitio web: www.beztshop.com</p>
              </div>
              <p className="mb-4 text-gray-300">
                De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los 
                Particulares (LFPDPPP), su Reglamento, y los Lineamientos del Aviso de Privacidad, BeztShop 
                (en adelante "el Responsable"), es responsable del tratamiento de sus datos personales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Datos Personales que Recabamos</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">2.1 Datos de Identificación y Contacto</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Número telefónico (fijo y/o celular)</li>
                  <li>Dirección de domicilio (calle, número, colonia, código postal, ciudad, estado)</li>
                  <li>Edad y fecha de nacimiento</li>
                  <li>RFC (para facturación electrónica)</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">2.2 Datos de Facturación y Pago</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Datos de facturación fiscal</li>
                  <li>Información de métodos de pago (procesada de forma segura)</li>
                  <li>Historial de transacciones y compras</li>
                  <li>Información de cuentas bancarias (solo últimos 4 dígitos para referencia)</li>
                </ul>
                <p className="text-sm text-[#00C8FF] mb-4">
                  <strong>Nota:</strong> Los datos financieros sensibles son procesados exclusivamente por 
                  nuestros procesadores de pago certificados (Mercado Pago, PayPal, Stripe) y no son 
                  almacenados directamente en nuestros servidores.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">2.3 Datos de Navegación y Uso</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Dirección IP</li>
                  <li>Tipo y versión de navegador</li>
                  <li>Sistema operativo</li>
                  <li>Páginas visitadas y tiempo de navegación</li>
                  <li>Productos visualizados y búsquedas realizadas</li>
                  <li>Ubicación geográfica aproximada</li>
                  <li>Cookies y tecnologías de rastreo</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">2.4 Datos de Terceros</h3>
                <p className="mb-4 text-gray-300">
                  En caso de utilizar Mercado Libre/Mercado Shops como canal de venta, también podemos 
                  recibir datos proporcionados por esta plataforma, incluyendo su perfil de comprador, 
                  historial de compras y calificaciones.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Finalidades del Tratamiento</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">3.1 Finalidades Primarias (Necesarias)</h3>
                <p className="mb-2 text-gray-300">Las siguientes finalidades son necesarias para la relación jurídica con usted:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Procesar y gestionar sus pedidos de compra</li>
                  <li>Verificar su identidad y validar información</li>
                  <li>Procesar pagos y facturación electrónica (CFDI)</li>
                  <li>Coordinar envíos y entregas de productos</li>
                  <li>Gestionar devoluciones, cambios y garantías</li>
                  <li>Proporcionar atención al cliente y soporte técnico</li>
                  <li>Cumplir obligaciones fiscales y legales</li>
                  <li>Prevenir fraude y proteger la seguridad</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">3.2 Finalidades Secundarias (Opcionales)</h3>
                <p className="mb-2 text-gray-300">Usted puede oponerse a estas finalidades sin afectar el servicio principal:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Enviar promociones, ofertas especiales y boletines informativos</li>
                  <li>Realizar estudios de mercado y análisis estadísticos</li>
                  <li>Mejorar nuestros productos y servicios</li>
                  <li>Personalizar su experiencia de compra</li>
                  <li>Enviar felicitaciones de cumpleaños y fechas especiales</li>
                  <li>Realizar encuestas de satisfacción</li>
                </ul>
                <p className="text-sm text-[#FFD700] mb-4">
                  Si desea oponerse al tratamiento de sus datos para estas finalidades secundarias, 
                  puede hacerlo enviando un correo a: atencionalcliente@beztshop.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Transferencia de Datos Personales</h2>
              <p className="mb-4 text-gray-300">
                Sus datos personales podrán ser transferidos y tratados dentro y fuera de México por las 
                siguientes entidades, con quienes tenemos celebrados convenios que garantizan la protección 
                de sus datos:
              </p>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">4.1 Transferencias Nacionales e Internacionales</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">Mercado Libre México / Mercado Shops:</strong> Para gestión de pagos, envíos y operación de tienda</li>
                  <li><strong className="text-[#FFD700]">Mercado Pago:</strong> Procesamiento de pagos electrónicos</li>
                  <li><strong className="text-[#FFD700]">Stripe:</strong> Procesamiento alternativo de pagos con tarjeta (EE.UU.)</li>
                  <li><strong className="text-[#FFD700]">PayPal:</strong> Procesamiento de pagos PayPal (EE.UU.)</li>
                  <li><strong className="text-[#FFD700]">Servicios de Paquetería:</strong> DHL, FedEx, Estafeta, para realizar entregas</li>
                  <li><strong className="text-[#FFD700]">Proveedores de Hosting:</strong> Servidores en la nube (México/EE.UU.)</li>
                  <li><strong className="text-[#FFD700]">Proveedores de Email:</strong> Para envío de notificaciones y comunicaciones</li>
                  <li><strong className="text-[#FFD700]">Servicios de Análisis:</strong> Google Analytics para estadísticas de uso</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">4.2 Consentimiento para Transferencias</h3>
                <p className="mb-4 text-gray-300">
                  Al aceptar este Aviso de Privacidad, usted otorga su consentimiento expreso para que sus 
                  datos personales sean transferidos en los términos señalados. Si desea limitar el uso o 
                  transferencia de sus datos, puede ejercer sus derechos ARCO conforme a la sección 6.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies y Tecnologías de Rastreo</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">5.1 Uso de Cookies</h3>
                <p className="mb-4 text-gray-300">
                  Utilizamos cookies, web beacons y otras tecnologías para recabar información sobre su 
                  comportamiento de navegación. Estas tecnologías nos permiten:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Mantener su sesión activa</li>
                  <li>Recordar sus preferencias</li>
                  <li>Analizar patrones de navegación</li>
                  <li>Personalizar contenido y publicidad</li>
                  <li>Mejorar la seguridad del sitio</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">5.2 Tipos de Cookies</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">Cookies Esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                  <li><strong className="text-[#FFD700]">Cookies de Rendimiento:</strong> Miden cómo los usuarios interactúan con el sitio</li>
                  <li><strong className="text-[#FFD700]">Cookies de Funcionalidad:</strong> Recuerdan sus preferencias</li>
                  <li><strong className="text-[#FFD700]">Cookies de Publicidad:</strong> Muestran anuncios relevantes</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">5.3 Gestión de Cookies</h3>
                <p className="mb-4 text-gray-300">
                  Puede deshabilitar o eliminar las cookies desde la configuración de su navegador. Sin embargo, 
                  esto puede afectar algunas funcionalidades del sitio.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Derechos ARCO y Revocación del Consentimiento</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">6.1 Sus Derechos (ARCO)</h3>
                <p className="mb-4 text-gray-300">
                  Conforme a la LFPDPPP, usted tiene derecho a:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">Acceder:</strong> Conocer qué datos personales tenemos y para qué los utilizamos</li>
                  <li><strong className="text-[#FFD700]">Rectificar:</strong> Solicitar la corrección de sus datos si son inexactos o incompletos</li>
                  <li><strong className="text-[#FFD700]">Cancelar:</strong> Solicitar que eliminemos sus datos de nuestras bases de datos</li>
                  <li><strong className="text-[#FFD700]">Oponerse:</strong> Oponerse al tratamiento de sus datos personales para fines específicos</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">6.2 Ejercicio de Derechos ARCO</h3>
                <p className="mb-4 text-gray-300">
                  Para ejercer sus derechos ARCO, debe enviar una solicitud a: 
                  <strong className="text-[#FFD700]"> atencionalcliente@beztshop.com</strong> con los siguientes datos:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Nombre completo del titular</li>
                  <li>Domicilio o correo electrónico para recibir notificaciones</li>
                  <li>Documentos que acrediten su identidad (INE o pasaporte)</li>
                  <li>Descripción clara y precisa de los datos respecto de los que busca ejercer sus derechos</li>
                  <li>Cualquier otro elemento que facilite la localización de sus datos</li>
                </ul>
                <p className="mb-4 text-gray-300">
                  Responderemos su solicitud en un plazo máximo de 20 días hábiles contados desde la fecha 
                  en que se recibió, a través del medio que usted señale. Si su solicitud es procedente, 
                  la haremos efectiva en un plazo máximo de 15 días hábiles.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">6.3 Revocación del Consentimiento</h3>
                <p className="mb-4 text-gray-300">
                  Puede revocar su consentimiento para el tratamiento de sus datos personales en cualquier 
                  momento, siguiendo el mismo procedimiento descrito para ejercer sus derechos ARCO.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Medidas de Seguridad</h2>
              <p className="mb-4 text-gray-300">
                Hemos implementado medidas de seguridad físicas, técnicas y administrativas para proteger 
                sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Cifrado SSL/TLS para transmisión de datos</li>
                <li>Servidores seguros con firewalls y sistemas de detección de intrusos</li>
                <li>Controles de acceso restringido a personal autorizado</li>
                <li>Auditorías de seguridad periódicas</li>
                <li>Protocolos de respaldo y recuperación de datos</li>
                <li>Capacitación continua del personal en protección de datos</li>
                <li>Cumplimiento con estándares PCI-DSS para procesamiento de pagos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Datos Personales Sensibles</h2>
              <p className="mb-4 text-gray-300">
                <strong className="text-[#FFD700]">No recabamos ni tratamos datos personales sensibles </strong> 
                tales como origen racial o étnico, estado de salud, información genética, creencias religiosas, 
                filosóficas y morales, afiliación sindical, opiniones políticas, preferencia sexual, salvo que 
                sea estrictamente necesario y previo consentimiento expreso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Menores de Edad</h2>
              <p className="mb-4 text-gray-300">
                Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos 
                intencionalmente datos personales de menores de edad sin el consentimiento de sus padres 
                o tutores. Si un padre o tutor descubre que su hijo nos ha proporcionado datos personales 
                sin su consentimiento, debe contactarnos inmediatamente para su eliminación.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Integración con Mercado Libre</h2>
              <p className="mb-4 text-gray-300">
                Si realiza compras a través de nuestra tienda en Mercado Libre/Mercado Shops, el tratamiento 
                de sus datos personales también estará sujeto al Aviso de Privacidad y Términos y Condiciones 
                de Mercado Libre México. Le recomendamos revisar dichas políticas en:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Privacidad de Mercado Libre: <a href="https://www.mercadolibre.com.mx/privacidad" className="text-[#00C8FF] hover:text-[#FFD700]">https://www.mercadolibre.com.mx/privacidad</a></li>
                <li>Términos y Condiciones: <a href="https://www.mercadolibre.com.mx/ayuda/terminos-y-condiciones_991" className="text-[#00C8FF] hover:text-[#FFD700]">https://www.mercadolibre.com.mx/ayuda/terminos-y-condiciones_991</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Usuarios de Estados Unidos (CCPA/CPRA)</h2>
              <p className="mb-4 text-gray-300">
                Si usted es residente de California, Estados Unidos, tiene derechos adicionales bajo la 
                California Consumer Privacy Act (CCPA) y California Privacy Rights Act (CPRA):
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Derecho a saber qué información personal recopilamos, usamos, divulgamos y vendemos</li>
                <li>Derecho a solicitar la eliminación de información personal</li>
                <li>Derecho a optar por no participar en la venta de información personal</li>
                <li>Derecho a la no discriminación por ejercer sus derechos de privacidad</li>
              </ul>
              <p className="mb-4 text-gray-300">
                <strong className="text-[#FFD700]">Declaración importante:</strong> No vendemos información 
                personal a terceros. Para ejercer sus derechos bajo CCPA/CPRA, contáctenos en 
                atencionalcliente@beztshop.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Cambios al Aviso de Privacidad</h2>
              <p className="mb-4 text-gray-300">
                Nos reservamos el derecho de actualizar este Aviso de Privacidad en cualquier momento para 
                reflejar cambios en nuestras prácticas de información. Cuando realicemos cambios materiales, 
                publicaremos el Aviso actualizado en nuestro sitio web e indicaremos la fecha de la última 
                actualización.
              </p>
              <p className="mb-4 text-gray-300">
                Los cambios serán efectivos inmediatamente después de su publicación. Le recomendamos 
                revisar periódicamente este Aviso para estar informado sobre cómo protegemos su información.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Autoridad de Protección de Datos</h2>
              <p className="mb-4 text-gray-300">
                Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede 
                acudir ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección 
                de Datos Personales (INAI):
              </p>
              <div className="bg-gradient-to-r from-[#00C8FF]/10 to-[#FFD700]/10 border border-[#00C8FF]/20 p-4 rounded-lg mb-4">
                <p className="text-white"><strong>INAI</strong></p>
                <p className="text-gray-300">Sitio web: <a href="https://home.inai.org.mx" className="text-[#00C8FF] hover:text-[#FFD700]">https://home.inai.org.mx</a></p>
                <p className="text-gray-300">Teléfono: 800 835 4324</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contacto</h2>
              <p className="mb-4 text-gray-300">
                Para cualquier pregunta, duda o comentario sobre este Aviso de Privacidad o el tratamiento 
                de sus datos personales, puede contactarnos en:
              </p>
              <div className="bg-gradient-to-r from-[#00C8FF]/10 to-[#FFD700]/10 border border-[#00C8FF]/20 p-4 rounded-lg">
                <p className="text-white"><strong>BeztShop</strong></p>
                <p className="text-white"><strong>Departamento de Protección de Datos</strong></p>
                <p className="text-gray-300">Email: atencionalcliente@beztshop.com</p>
                <p className="text-gray-300">Teléfono: +52 998 578 0385</p>
                <p className="text-gray-300">Sitio web: www.beztshop.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">15. Consentimiento</h2>
              <p className="mb-4 text-gray-300">
                Al proporcionar sus datos personales a través de cualquiera de nuestros canales (sitio web, 
                Mercado Libre, correo electrónico, teléfono), y al hacer uso de nuestros servicios, usted 
                acepta y consiente que sus datos personales sean tratados conforme a los términos y condiciones 
                de este Aviso de Privacidad.
              </p>
              <p className="mb-4 text-[#FFD700]">
                <strong>Si no está de acuerdo con este Aviso de Privacidad, le solicitamos que no nos 
                proporcione sus datos personales ni utilice nuestros servicios.</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}