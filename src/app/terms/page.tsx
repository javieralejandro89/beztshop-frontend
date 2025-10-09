// src/app/terms/page.tsx - Términos de Servicio México/US - Dark Tech Theme
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
            Términos y Condiciones de Uso
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
              <h2 className="text-2xl font-semibold text-white mb-4">1. Aceptación de los Términos</h2>
              <p className="mb-4 text-gray-300">
                Al acceder y utilizar el sitio web www.beztshop.com y/o nuestra tienda en Mercado Libre 
                (en adelante, el "Sitio" o los "Servicios"), operados por <strong className="text-[#FFD700]">BeztShop</strong> 
                (en adelante "nosotros", "nuestro" o "la empresa"), usted acepta estar legalmente obligado por 
                estos Términos y Condiciones de Uso, así como por nuestro Aviso de Privacidad.
              </p>
              <p className="mb-4 text-gray-300">
                Si no está de acuerdo con alguno de estos términos, le solicitamos que no utilice nuestros 
                servicios. El uso continuado del Sitio constituye su aceptación de cualquier modificación a 
                estos términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Información de la Empresa</h2>
              <div className="bg-gradient-to-r from-[#00C8FF]/10 to-[#FFD700]/10 border border-[#00C8FF]/20 p-4 rounded-lg mb-4">
                <p className="text-white mb-2"><strong>BeztShop</strong></p>
                <p className="text-gray-300">Domicilio: Ciudad de México, CDMX, México</p>
                <p className="text-gray-300">Correo electrónico: atencionalcliente@beztshop.com</p>
                <p className="text-gray-300">Teléfono: +52 998 578 0385</p>
                <p className="text-gray-300">Sitio web: www.beztshop.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Descripción de los Servicios</h2>
              <p className="mb-4 text-gray-300">
                BeztShop es una tienda en línea que comercializa productos electrónicos, tecnológicos y 
                artículos diversos. Ofrecemos nuestros servicios a través de:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li><strong className="text-[#FFD700]">Sitio Web Directo:</strong> www.beztshop.com</li>
                <li><strong className="text-[#FFD700]">Mercado Libre/Mercado Shops:</strong> Tienda oficial en la plataforma</li>
              </ul>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">3.1 Servicios Ofrecidos</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Venta de productos nuevos y originales</li>
                  <li>Envíos a toda la República Mexicana</li>
                  <li>Envíos internacionales a Estados Unidos (en expansión)</li>
                  <li>Múltiples métodos de pago</li>
                  <li>Facturación electrónica (CFDI 4.0)</li>
                  <li>Sistema de cupones y descuentos</li>
                  <li>Atención al cliente vía email, teléfono y chat</li>
                  <li>Garantías según fabricante</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Registro y Cuenta de Usuario</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">4.1 Creación de Cuenta</h3>
                <p className="mb-4 text-gray-300">
                  Para realizar compras, es necesario crear una cuenta proporcionando información veraz, 
                  completa y actualizada. Usted es responsable de:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Mantener la confidencialidad de su contraseña</li>
                  <li>Todas las actividades que ocurran bajo su cuenta</li>
                  <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                  <li>Actualizar su información cuando sea necesario</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">4.2 Requisitos de Edad</h3>
                <p className="mb-4 text-gray-300">
                  Debe ser mayor de 18 años para crear una cuenta y realizar compras. Los menores de edad 
                  solo pueden utilizar nuestros servicios bajo la supervisión y consentimiento de un padre 
                  o tutor legal.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">4.3 Suspensión de Cuenta</h3>
                <p className="mb-4 text-gray-300">
                  Nos reservamos el derecho de suspender o cancelar su cuenta si detectamos:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Información falsa o fraudulenta</li>
                  <li>Violación de estos términos</li>
                  <li>Actividades sospechosas o ilegales</li>
                  <li>Uso indebido de cupones o promociones</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Productos y Precios</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">5.1 Descripciones de Productos</h3>
                <p className="mb-4 text-gray-300">
                  Hacemos nuestro mejor esfuerzo para describir los productos con precisión. Sin embargo, 
                  no garantizamos que las descripciones, fotografías o contenido del Sitio sean completamente 
                  precisos, completos, confiables o libres de errores.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">5.2 Precios y Moneda</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">México:</strong> Todos los precios se muestran en Pesos Mexicanos (MXN) e incluyen IVA (16%)</li>
                  <li><strong className="text-[#FFD700]">Estados Unidos:</strong> Los precios se muestran en Dólares (USD) más impuestos aplicables según el estado</li>
                  <li>Nos reservamos el derecho de modificar precios sin previo aviso</li>
                  <li>El precio aplicable será el vigente al momento de confirmar la compra</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">5.3 Disponibilidad</h3>
                <p className="mb-4 text-gray-300">
                  La disponibilidad de productos está sujeta a cambios sin previo aviso. En caso de que un 
                  producto ya no esté disponible después de realizar su pedido, le notificaremos y 
                  reembolsaremos el pago completo.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">5.4 Errores de Precio</h3>
                <p className="mb-4 text-gray-300">
                  Si descubrimos un error en el precio de un producto que haya comprado, le notificaremos 
                  lo antes posible y le daremos la opción de:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Reconfirmar su pedido al precio correcto</li>
                  <li>Cancelar su pedido y recibir un reembolso completo</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Proceso de Compra y Pago</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">6.1 Métodos de Pago Aceptados</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">Mercado Pago:</strong> Tarjetas de crédito/débito, transferencia, efectivo en puntos autorizados</li>
                  <li><strong className="text-[#FFD700]">PayPal:</strong> Pagos con cuenta PayPal o tarjeta</li>
                  <li><strong className="text-[#FFD700]">Stripe:</strong> Tarjetas de crédito/débito internacionales</li>
                  <li><strong className="text-[#FFD700]">Transferencia Bancaria:</strong> Depósito directo (requiere confirmación manual)</li>
                  <li><strong className="text-[#FFD700]">Pago en Efectivo:</strong> A través de puntos autorizados (OXXO, 7-Eleven, etc.)</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">6.2 Procesamiento de Pedidos</h3>
                <p className="mb-4 text-gray-300">
                  <strong className="text-[#FFD700]">Importante:</strong> Todos los pedidos son procesados 
                  manualmente por nuestro equipo. El proceso incluye:
                </p>
                <ol className="list-decimal pl-6 mb-4 text-gray-300">
                  <li>Recepción del pedido</li>
                  <li>Verificación de pago (máximo 24 horas hábiles)</li>
                  <li>Verificación de disponibilidad de productos</li>
                  <li>Confirmación del pedido por email</li>
                  <li>Preparación y empaque</li>
                  <li>Envío (con número de rastreo)</li>
                </ol>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">6.3 Confirmación de Pedido</h3>
                <p className="mb-4 text-gray-300">
                  La recepción de un correo electrónico de confirmación NO garantiza la aceptación de su 
                  pedido. Nos reservamos el derecho de rechazar cualquier pedido por razones que incluyen, 
                  pero no se limitan a:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Falta de disponibilidad del producto</li>
                  <li>Errores en el pedido o información de pago</li>
                  <li>Detección de fraude</li>
                  <li>Restricciones geográficas</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">6.4 Facturación Electrónica (CFDI)</h3>
                <p className="mb-4 text-gray-300">
                  Para clientes en México, emitimos facturas electrónicas (CFDI 4.0) conforme a la legislación 
                  fiscal vigente. Debe solicitarla dentro de los 5 días naturales posteriores a la compra 
                  proporcionando:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>RFC (Registro Federal de Contribuyentes)</li>
                  <li>Razón Social o Nombre completo</li>
                  <li>Código Postal fiscal</li>
                  <li>Uso de CFDI</li>
                  <li>Régimen Fiscal</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Envíos y Entregas</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">7.1 Cobertura de Envíos</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">México:</strong> Envíos a toda la República Mexicana</li>
                  <li><strong className="text-[#FFD700]">Estados Unidos:</strong> Envíos a los 50 estados (servicio en expansión)</li>
                  <li>No realizamos envíos a apartados postales (P.O. Box)</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">7.2 Tiempos de Entrega</h3>
                <p className="mb-4 text-gray-300"><strong className="text-[#FFD700]">México:</strong></p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Zona Metropolitana: 2-4 días hábiles</li>
                  <li>Interior de la República: 4-7 días hábiles</li>
                  <li>Zonas remotas: 7-10 días hábiles</li>
                </ul>
                <p className="mb-4 text-gray-300"><strong className="text-[#FFD700]">Estados Unidos:</strong></p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Estados contiguos: 5-10 días hábiles</li>
                  <li>Alaska y Hawaii: 10-15 días hábiles</li>
                </ul>
                <p className="text-sm text-[#00C8FF] mb-4">
                  Los tiempos de entrega son estimados y pueden variar según la paquetería y condiciones 
                  externas (clima, aduanas, días festivos).
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">7.3 Costos de Envío</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">Envío Gratis:</strong> Pedidos mayores a $1,500 MXN (México) o $100 USD (EE.UU.)</li>
                  <li><strong className="text-[#FFD700]">Envío Estándar:</strong> Calculado según peso, dimensiones y destino</li>
                  <li><strong className="text-[#FFD700]">Envío Express:</strong> Disponible con costo adicional</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">7.4 Rastreo de Pedidos</h3>
                <p className="mb-4 text-gray-300">
                  Una vez enviado su pedido, recibirá un número de rastreo por email que le permitirá 
                  seguir su paquete en tiempo real a través del sitio web de la paquetería.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">7.5 Recepción de Pedidos</h3>
                <p className="mb-4 text-gray-300">
                  Al recibir su pedido, le recomendamos:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Verificar que el paquete esté en buenas condiciones</li>
                  <li>Revisar que el contenido sea correcto</li>
                  <li>Si hay daños visibles, documentarlos con fotografías antes de aceptar</li>
                  <li>Contactarnos inmediatamente si hay problemas</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Devoluciones, Cambios y Garantías</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">8.1 Política de Devoluciones</h3>
                <p className="mb-4 text-gray-300">
                  Conforme a la Ley Federal de Protección al Consumidor (México) y normas aplicables, 
                  aceptamos devoluciones bajo las siguientes condiciones:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">Plazo:</strong> Dentro de 30 días naturales posteriores a la entrega</li>
                  <li><strong className="text-[#FFD700]">Condición:</strong> Producto sin usar, en empaque original, con todos los accesorios</li>
                  <li><strong className="text-[#FFD700]">Motivos válidos:</strong> Producto defectuoso, equivocación en el envío, no coincide con la descripción</li>
                  <li><strong className="text-[#FFD700]">Costo de devolución:</strong> Gratis si es error nuestro; por cuenta del cliente en caso contrario</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">8.2 Productos No Retornables</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Productos personalizados o hechos bajo pedido</li>
                  <li>Artículos en liquidación o venta final</li>
                  <li>Software o contenido digital descargable</li>
                  <li>Productos de higiene personal una vez abiertos</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">8.3 Proceso de Devolución</h3>
                <ol className="list-decimal pl-6 mb-4 text-gray-300">
                  <li>Contactar a atencionalcliente@beztshop.com con número de pedido y motivo</li>
                  <li>Recibir autorización de devolución (RMA)</li>
                  <li>Enviar el producto según instrucciones proporcionadas</li>
                  <li>Una vez recibido e inspeccionado, procesaremos el reembolso</li>
                </ol>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">8.4 Reembolsos</h3>
                <p className="mb-4 text-gray-300">
                  Los reembolsos se procesarán al método de pago original dentro de 5-10 días hábiles 
                  después de recibir y aprobar la devolución. Los costos de envío no son reembolsables 
                  excepto en casos de productos defectuosos o errores de nuestra parte.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">8.5 Garantías</h3>
                <p className="mb-4 text-gray-300">
                  Todos los productos están respaldados por la garantía del fabricante. Las condiciones 
                  específicas varían según el producto. Para hacer válida una garantía:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Contactarnos con evidencia del defecto</li>
                  <li>Proporcionar número de serie y comprobante de compra</li>
                  <li>Seguir las instrucciones del fabricante</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Cupones y Promociones</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">9.1 Términos Generales</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li>Los cupones tienen fecha de vencimiento y no son válidos después de esta</li>
                  <li>Solo se puede usar un cupón por pedido, salvo especificación contraria</li>
                  <li>Los cupones no son transferibles ni canjeables por efectivo</li>
                  <li>Nos reservamos el derecho de cancelar cupones en caso de fraude o abuso</li>
                  <li>Algunos productos pueden estar excluidos de promociones</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">9.2 Tipos de Cupones</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-300">
                  <li><strong className="text-[#FFD700]">Porcentaje:</strong> Descuento sobre el valor del pedido</li>
                  <li><strong className="text-[#FFD700]">Cantidad Fija:</strong> Monto específico de descuento</li>
                  <li><strong className="text-[#FFD700]">Envío Gratis:</strong> Elimina el costo de envío</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Integración con Mercado Libre</h2>
              <p className="mb-4 text-gray-300">
                Si realiza compras a través de nuestra tienda oficial en Mercado Libre/Mercado Shops, 
                también aplican los siguientes términos:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Términos y Condiciones de Mercado Libre México</li>
                <li>Políticas de devolución de Mercado Libre</li>
                <li>Sistema de calificación y reputación de Mercado Libre</li>
                <li>Mercado Pago como procesador de pagos principal</li>
              </ul>
              <p className="mb-4 text-gray-300">
                Para más información, visite: 
                <a href="https://www.mercadolibre.com.mx/ayuda/terminos-y-condiciones_991" className="text-[#00C8FF] hover:text-[#FFD700]"> 
                  {' '}Términos de Mercado Libre
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Propiedad Intelectual</h2>
              <p className="mb-4 text-gray-300">
                Todo el contenido del Sitio, incluyendo pero no limitado a textos, gráficos, logotipos, 
                iconos, imágenes, videos, audio, descargas digitales, compilaciones de datos y software, 
                es propiedad de BeztShop o sus proveedores de contenido y está protegido por:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Leyes de Derechos de Autor de México y Estados Unidos</li>
                <li>Leyes de Marcas Registradas</li>
                <li>Tratados internacionales de propiedad intelectual</li>
              </ul>
              <p className="mb-4 text-gray-300">
                Queda estrictamente prohibido reproducir, distribuir, modificar o crear trabajos derivados 
                sin nuestro consentimiento previo por escrito.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Uso Prohibido</h2>
              <p className="mb-4 text-gray-300">Al utilizar nuestros servicios, usted acepta NO:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Violar leyes locales, estatales, nacionales o internacionales</li>
                <li>Infringir o violar derechos de propiedad intelectual</li>
                <li>Transmitir virus, malware o código malicioso</li>
                <li>Realizar ingeniería inversa o descompilar el software</li>
                <li>Utilizar el sitio para recopilar información de otros usuarios</li>
                <li>Hacerse pasar por otra persona o entidad</li>
                <li>Interferir con la seguridad del sitio o servidores</li>
                <li>Usar bots, scripts o herramientas automatizadas sin autorización</li>
                <li>Realizar compras fraudulentas o con intención de reventa no autorizada</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Limitación de Responsabilidad</h2>
              <p className="mb-4 text-gray-300">
                En la medida máxima permitida por la ley aplicable, BeztShop no será responsable de:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Daños indirectos, incidentales, especiales, consecuentes o punitivos</li>
                <li>Pérdida de beneficios, ingresos, datos o uso</li>
                <li>Daños resultantes del uso o imposibilidad de usar nuestros servicios</li>
                <li>Errores u omisiones en el contenido del sitio</li>
                <li>Acceso no autorizado a servidores o datos</li>
                <li>Interrupciones o errores en la transmisión</li>
              </ul>
              <p className="mb-4 text-gray-300">
                Nuestra responsabilidad total no excederá el monto pagado por usted en el pedido específico 
                que dio origen al reclamo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">14. Indemnización</h2>
              <p className="mb-4 text-gray-300">
                Usted acepta indemnizar, defender y mantener indemne a BeztShop, sus directivos, empleados, 
                agentes y afiliados de cualquier reclamación, daño, obligación, pérdida, responsabilidad, 
                costo o deuda, y gasto que surja de:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300">
                <li>Su uso y acceso al Sitio</li>
                <li>Violación de estos Términos y Condiciones</li>
                <li>Violación de derechos de terceros, incluyendo propiedad intelectual</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">15. Resolución de Disputas</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">15.1 Ley Aplicable y Jurisdicción</h3>
                <p className="mb-4 text-gray-300">
                  <strong className="text-[#FFD700]">Para clientes en México:</strong> Estos términos se 
                  regirán por las leyes de México. Cualquier controversia se someterá a la jurisdicción de 
                  los tribunales competentes de la Ciudad de México.
                </p>
                <p className="mb-4 text-gray-300">
                  <strong className="text-[#FFD700]">Para clientes en Estados Unidos:</strong> Estos términos 
                  se regirán por las leyes federales de Estados Unidos y las leyes del estado donde se 
                  originó la transacción.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">15.2 PROFECO (México)</h3>
                <p className="mb-4 text-gray-300">
                  Conforme a la Ley Federal de Protección al Consumidor, los clientes mexicanos tienen 
                  derecho a presentar quejas ante la Procuraduría Federal del Consumidor (PROFECO):
                </p>
                <div className="bg-gradient-to-r from-[#00C8FF]/10 to-[#FFD700]/10 border border-[#00C8FF]/20 p-4 rounded-lg mb-4">
                  <p className="text-white"><strong>PROFECO</strong></p>
                  <p className="text-gray-300">Teléfono: 55 5568 8722 / 800 468 8722</p>
                  <p className="text-gray-300">Sitio web: <a href="https://www.gob.mx/profeco" className="text-[#00C8FF] hover:text-[#FFD700]">https://www.gob.mx/profeco</a></p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">16. Modificaciones</h2>
              <p className="mb-4 text-gray-300">
                Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. 
                Las modificaciones serán efectivas inmediatamente después de su publicación en el Sitio. 
                Su uso continuado del Sitio después de cualquier modificación constituye su aceptación de 
                los nuevos términos.
              </p>
              <p className="mb-4 text-gray-300">
                Le recomendamos revisar periódicamente estos términos para estar informado de cualquier cambio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">17. Divisibilidad</h2>
              <p className="mb-4 text-gray-300">
                Si cualquier disposición de estos términos se considera inválida o inaplicable por un 
                tribunal de jurisdicción competente, dicha disposición será modificada y interpretada para 
                cumplir los objetivos de dicha disposición en la mayor medida posible bajo la ley aplicable, 
                y las disposiciones restantes continuarán en pleno vigor y efecto.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">18. Acuerdo Completo</h2>
              <p className="mb-4 text-gray-300">
                Estos Términos y Condiciones, junto con nuestro Aviso de Privacidad y cualquier política 
                adicional publicada en el Sitio, constituyen el acuerdo completo entre usted y BeztShop 
                con respecto al uso de nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">19. Contacto</h2>
              <p className="mb-4 text-gray-300">
                Para preguntas sobre estos Términos y Condiciones, puede contactarnos en:
              </p>
              <div className="bg-gradient-to-r from-[#00C8FF]/10 to-[#FFD700]/10 border border-[#00C8FF]/20 p-4 rounded-lg">
                <p className="text-white"><strong>BeztShop</strong></p>
                <p className="text-white"><strong>Atención al Cliente</strong></p>
                <p className="text-gray-300">Email: atencionalcliente@beztshop.com</p>
                <p className="text-gray-300">Teléfono: +52 998 578 0385</p>
                <p className="text-gray-300">Sitio web: www.beztshop.com</p>
                <p className="text-gray-300">Horario: Lunes a Viernes, 9:00 AM - 6:00 PM (Hora del Centro de México)</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">20. Reconocimiento</h2>
              <p className="mb-4 text-[#FFD700]">
                <strong>Al utilizar nuestro Sitio y Servicios, usted reconoce que ha leído, entendido y 
                acepta estar obligado por estos Términos y Condiciones.</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}