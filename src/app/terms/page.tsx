// src/app/terms/page.tsx - Dark Tech Theme
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-darkbg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <div className="mb-6">
          <Link 
            href="/auth/login"
            className="inline-flex items-center text-gray-400 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Link>
        </div>
        <div className="bg-darkbg-light/90 backdrop-blur-sm border border-gold/20 rounded-lg shadow-glow-gold p-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            Términos de Servicio
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-400 mb-8">
              <strong className="text-gold">Última actualización:</strong> {new Date().toLocaleDateString('es-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Aceptación de los Términos</h2>
              <p className="mb-4 text-gray-300">
                Al acceder y utilizar el sitio web de ServiPro Garcia LLC ("nosotros", "nuestro", "la empresa"), 
                usted acepta estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. 
                Si no está de acuerdo con alguno de estos términos, no debe utilizar este sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Descripción del Servicio</h2>
              <p className="mb-4 text-gray-300">
                ServiPro Garcia LLC opera una tienda en línea que vende productos electrónicos en todo el territorio 
                de Estados Unidos. Nuestros servicios incluyen:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Venta de productos electrónicos</li>
                <li>Procesamiento de pedidos</li>
                <li>Servicios de envío y entrega</li>
                <li>Atención al cliente</li>
                <li>Sistema de cupones y descuentos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Proceso de Pedidos y Pago</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">3.1 Procesamiento de Pedidos</h3>
                <p className="mb-4 text-gray-300">
                  Todos los pedidos se procesan manualmente por nuestro equipo administrativo. El proceso incluye:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Revisión y confirmación del pedido</li>
                  <li>Verificación de la disponibilidad del producto</li>
                  <li>Confirmación del pago recibido</li>
                  <li>Preparación y envío del producto</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">3.2 Métodos de Pago</h3>
                <p className="mb-4 text-gray-300">
                  Actualmente aceptamos pagos a través de Zelle. Una vez realizado el pedido, recibirá instrucciones 
                  detalladas para completar el pago. Su pedido no será procesado hasta que se confirme la recepción del pago.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">3.3 Confirmación de Pedidos</h3>
                <p className="mb-4 text-gray-300">
                  La aceptación de su pedido está sujeta a la disponibilidad del producto y la confirmación del pago. 
                  Nos reservamos el derecho de rechazar o cancelar cualquier pedido a nuestra discreción.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Envíos y Entrega</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">4.1 Opciones de Envío</h3>
                <p className="mb-4 text-gray-300">Ofrecemos las siguientes opciones de envío:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-gold">Envío Estándar:</strong> 5-7 días hábiles</li>
                  <li><strong className="text-gold">Envío Rápido:</strong> 2-3 días hábiles</li>
                  <li><strong className="text-gold">Envío Overnight:</strong> 1 día hábil (siguiente día)</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">4.2 Envío Gratuito</h3>
                <p className="mb-4 text-gray-300">
                  Los pedidos con un valor total de $100.00 USD o más califican para envío gratuito estándar 
                  dentro del territorio continental de Estados Unidos.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">4.3 Limitaciones Geográficas</h3>
                <p className="mb-4 text-gray-300">
                  Actualmente solo realizamos envíos dentro del territorio de Estados Unidos, incluyendo 
                  Alaska y Hawaii. No realizamos envíos internacionales.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Cupones y Descuentos</h2>
              <p className="mb-4 text-gray-300">
                Ofrecemos varios tipos de cupones y descuentos promocionales. Los términos específicos de cada 
                promoción se indicarán claramente al momento de la oferta. Los cupones no son transferibles y 
                tienen fechas de vencimiento. No se pueden combinar múltiples ofertas a menos que se indique 
                específicamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Política de Devoluciones</h2>
              <p className="mb-4 text-gray-300">
                Las devoluciones están sujetas a las siguientes condiciones:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Los productos deben devolverse dentro de 30 días de la fecha de entrega</li>
                <li>Los productos deben estar en su estado original y sin usar</li>
                <li>Debe incluirse el empaque original y todos los accesorios</li>
                <li>Los gastos de envío de devolución corren por cuenta del cliente</li>
                <li>Los reembolsos se procesarán una vez que recibamos y inspeccionen el producto devuelto</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Garantías y Responsabilidades</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">7.1 Garantía de Productos</h3>
                <p className="mb-4 text-gray-300">
                  Todos los productos están sujetos a las garantías del fabricante. No ofrecemos garantías 
                  adicionales más allá de las proporcionadas por el fabricante original.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">7.2 Limitación de Responsabilidad</h3>
                <p className="mb-4 text-gray-300">
                  En la medida máxima permitida por la ley, ServiPro Garcia LLC no será responsable por 
                  daños indirectos, incidentales, especiales o consecuentes que resulten del uso de nuestros 
                  productos o servicios.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Uso Aceptable</h2>
              <p className="mb-4 text-gray-300">Al usar nuestro sitio web, usted acepta:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>No utilizar el sitio para fines ilegales o no autorizados</li>
                <li>No interferir con la seguridad del sitio web</li>
                <li>Proporcionar información precisa y actualizada</li>
                <li>No intentar obtener acceso no autorizado a nuestros sistemas</li>
                <li>Respetar los derechos de propiedad intelectual</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Propiedad Intelectual</h2>
              <p className="mb-4 text-gray-300">
                Todo el contenido del sitio web, incluyendo pero no limitado a texto, gráficos, logotipos, 
                imágenes y software, es propiedad de ServiPro Garcia LLC o sus licenciantes y está protegido 
                por las leyes de derechos de autor y otras leyes de propiedad intelectual.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Modificaciones de los Términos</h2>
              <p className="mb-4 text-gray-300">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones 
                entrarán en vigor inmediatamente después de su publicación en el sitio web. El uso continuado 
                del sitio web después de cualquier modificación constituye su aceptación de los nuevos términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Ley Aplicable y Jurisdicción</h2>
              <p className="mb-4 text-gray-300">
                Estos términos se regirán e interpretarán de acuerdo con las leyes del estado donde ServiPro Garcia LLC 
                esté incorporada, sin considerar sus disposiciones de conflicto de leyes. Cualquier disputa 
                que surja de estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de dicho estado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Información de Contacto</h2>
              <p className="mb-4 text-gray-300">
                Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en:
              </p>
              <div className="bg-gradient-to-r from-cyan/10 to-gold/10 border border-cyan/20 p-4 rounded-lg">
                <p className="text-white"><strong>ServiPro Garcia LLC</strong></p>
                <p className="text-gray-300">Email: contacto@serviprogarcia.com</p>
                <p className="text-gray-300">Sitio web: www.serviprogarcia.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Separabilidad</h2>
              <p className="mb-4 text-gray-300">
                Si cualquier disposición de estos términos se considera inválida o inaplicable, el resto 
                de los términos permanecerá en pleno vigor y efecto.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">14. Acuerdo Completo</h2>
              <p className="mb-4 text-gray-300">
                Estos Términos de Servicio constituyen el acuerdo completo entre usted y ServiPro Garcia LLC 
                con respecto al uso de nuestro sitio web y servicios, y reemplazan todos los acuerdos anteriores 
                y contemporáneos, ya sean escritos u orales.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}