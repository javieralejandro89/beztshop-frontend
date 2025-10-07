// src/app/privacy/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
<div className="mb-6">
  <Link 
    href="/auth/login"
    className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Volver al Login
  </Link>
</div>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
              <p className="mb-4">
                ServiPro Garcia LLC ("nosotros", "nuestro", "la empresa") respeta su privacidad y se compromete 
                a proteger su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, 
                divulgamos y protegemos su información cuando visita nuestro sitio web y utiliza nuestros servicios.
              </p>
              <p className="mb-4">
                Al usar nuestro sitio web, usted acepta las prácticas descritas en esta Política de Privacidad. 
                Si no está de acuerdo con esta política, no debe utilizar nuestro sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Información que Recopilamos</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">2.1 Información Personal que Usted Proporciona</h3>
                <p className="mb-4">Recopilamos información personal que usted nos proporciona voluntariamente, incluyendo:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Información de Cuenta:</strong> Nombre, apellido, dirección de correo electrónico, número de teléfono</li>
                  <li><strong>Información de Facturación y Envío:</strong> Direcciones de facturación y envío, información de pago</li>
                  <li><strong>Información de Pedidos:</strong> Historial de compras, preferencias de productos</li>
                  <li><strong>Comunicaciones:</strong> Mensajes que nos envía a través del sitio web o correo electrónico</li>
                  <li><strong>Información de Soporte:</strong> Detalles cuando solicita atención al cliente</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">2.2 Información Recopilada Automáticamente</h3>
                <p className="mb-4">Cuando visita nuestro sitio web, recopilamos automáticamente cierta información, incluyendo:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Datos de Uso:</strong> Páginas visitadas, tiempo en el sitio, clics, búsquedas</li>
                  <li><strong>Información del Dispositivo:</strong> Dirección IP, tipo de navegador, sistema operativo</li>
                  <li><strong>Datos de Ubicación:</strong> Ubicación geográfica aproximada basada en su dirección IP</li>
                  <li><strong>Cookies y Tecnologías Similares:</strong> Información almacenada por cookies y tecnologías de seguimiento</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">2.3 Información de Terceros</h3>
                <p className="mb-4">
                  Podemos recibir información sobre usted de fuentes de terceros, como servicios de verificación 
                  de direcciones, servicios de análisis y plataformas de redes sociales.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cómo Utilizamos su Información</h2>
              <p className="mb-4">Utilizamos la información recopilada para los siguientes propósitos:</p>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.1 Prestación de Servicios</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Procesar y gestionar sus pedidos</li>
                  <li>Verificar pagos y procesar transacciones</li>
                  <li>Coordinar envíos y entregas</li>
                  <li>Proporcionar atención al cliente</li>
                  <li>Gestionar devoluciones y reembolsos</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.2 Comunicación</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Enviar confirmaciones de pedidos y actualizaciones de estado</li>
                  <li>Responder a sus consultas y solicitudes</li>
                  <li>Enviar notificaciones importantes sobre el servicio</li>
                  <li>Proporcionar información promocional (solo con su consentimiento)</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.3 Mejora del Servicio</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Analizar el uso del sitio web para mejorar la experiencia del usuario</li>
                  <li>Desarrollar nuevos productos y servicios</li>
                  <li>Personalizar contenido y ofertas</li>
                  <li>Prevenir fraude y mantener la seguridad</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.4 Cumplimiento Legal</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Cumplir con obligaciones legales y reglamentarias</li>
                  <li>Responder a procesos legales válidos</li>
                  <li>Proteger nuestros derechos e intereses legítimos</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartir Información</h2>
              <p className="mb-4">
                No vendemos, alquilamos ni comercializamos su información personal a terceros. 
                Podemos compartir su información en las siguientes circunstancias limitadas:
              </p>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.1 Proveedores de Servicios</h3>
                <p className="mb-4">
                  Compartimos información con proveedores de servicios que nos ayudan a operar nuestro negocio:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Procesadores de pagos</li>
                  <li>Servicios de envío y logística</li>
                  <li>Servicios de análisis y marketing</li>
                  <li>Proveedores de hosting y tecnología</li>
                  <li>Servicios de atención al cliente</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.2 Cumplimiento Legal</h3>
                <p className="mb-4">Podemos divulgar información cuando sea requerido por ley o para:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Cumplir con citaciones, órdenes judiciales o procesos legales</li>
                  <li>Proteger nuestros derechos, propiedad o seguridad</li>
                  <li>Prevenir fraude o actividades ilegales</li>
                  <li>Proteger la seguridad de nuestros usuarios o el público</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.3 Transacciones Comerciales</h3>
                <p className="mb-4">
                  En caso de fusión, adquisición o venta de activos, su información personal puede 
                  transferirse como parte de la transacción.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies y Tecnologías de Seguimiento</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.1 Qué son las Cookies</h3>
                <p className="mb-4">
                  Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando 
                  visita nuestro sitio web. Utilizamos cookies para mejorar su experiencia y analizar 
                  el uso del sitio.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.2 Tipos de Cookies que Utilizamos</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
                  <li><strong>Cookies de Rendimiento:</strong> Nos ayudan a entender cómo los usuarios interactúan con el sitio</li>
                  <li><strong>Cookies de Funcionalidad:</strong> Recuerdan sus preferencias y configuraciones</li>
                  <li><strong>Cookies de Marketing:</strong> Utilizadas para mostrar anuncios relevantes</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.3 Gestión de Cookies</h3>
                <p className="mb-4">
                  Puede controlar y eliminar cookies a través de la configuración de su navegador. 
                  Sin embargo, desactivar ciertas cookies puede afectar la funcionalidad del sitio web.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Seguridad de la Información</h2>
              <p className="mb-4">
                Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas para 
                proteger su información personal contra acceso no autorizado, divulgación, alteración o destrucción:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Cifrado de datos en tránsito y en reposo</li>
                <li>Controles de acceso estrictos</li>
                <li>Monitoreo regular de seguridad</li>
                <li>Capacitación del personal en prácticas de privacidad</li>
                <li>Auditorías de seguridad periódicas</li>
              </ul>
              <p className="mb-4">
                Sin embargo, ningún método de transmisión por internet o almacenamiento electrónico es 
                100% seguro. No podemos garantizar la seguridad absoluta de su información.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Sus Derechos de Privacidad</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">7.1 Derechos Generales</h3>
                <p className="mb-4">Dependiendo de su ubicación, puede tener los siguientes derechos:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Acceso:</strong> Solicitar información sobre los datos personales que tenemos sobre usted</li>
                  <li><strong>Rectificación:</strong> Solicitar la corrección de información inexacta</li>
                  <li><strong>Eliminación:</strong> Solicitar la eliminación de su información personal</li>
                  <li><strong>Portabilidad:</strong> Solicitar una copia de sus datos en un formato estructurado</li>
                  <li><strong>Objeción:</strong> Oponerse al procesamiento de sus datos personales</li>
                  <li><strong>Restricción:</strong> Solicitar la limitación del procesamiento</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">7.2 Derechos bajo la Ley de Privacidad del Consumidor de California (CCPA)</h3>
                <p className="mb-4">Si es residente de California, tiene derechos adicionales bajo el CCPA:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Derecho a saber qué información personal recopilamos, utilizamos y divulgamos</li>
                  <li>Derecho a solicitar la eliminación de información personal</li>
                  <li>Derecho a optar por no participar en la venta de información personal</li>
                  <li>Derecho a no ser discriminado por ejercer sus derechos de privacidad</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">7.3 Cómo Ejercer sus Derechos</h3>
                <p className="mb-4">
                  Para ejercer cualquiera de estos derechos, contáctenos en contacto@serviprogarcia.com. 
                  Verificaremos su identidad antes de procesar su solicitud.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retención de Datos</h2>
              <p className="mb-4">
                Conservamos su información personal solo durante el tiempo necesario para cumplir con los 
                propósitos descritos en esta política, a menos que la ley requiera o permita un período 
                de retención más largo. Los factores que consideramos incluyen:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>La duración de nuestra relación comercial</li>
                <li>Requisitos legales y reglamentarios</li>
                <li>Necesidades de resolución de disputas</li>
                <li>Propósitos legítimos de negocio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Transferencias Internacionales</h2>
              <p className="mb-4">
                Sus datos personales pueden transferirse y procesarse en países fuera de Estados Unidos. 
                Cuando esto ocurra, implementaremos salvaguardas apropiadas para proteger su información 
                de acuerdo con los estándares de privacidad aplicables.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Privacidad de Menores</h2>
              <p className="mb-4">
                Nuestro sitio web no está dirigido a menores de 13 años. No recopilamos conscientemente 
                información personal de niños menores de 13 años. Si descubrimos que hemos recopilado 
                información personal de un menor de 13 años, eliminaremos esa información inmediatamente.
              </p>
              <p className="mb-4">
                Si es padre o tutor y cree que su hijo nos ha proporcionado información personal, 
                contáctenos inmediatamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Marketing y Comunicaciones</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">11.1 Comunicaciones de Marketing</h3>
                <p className="mb-4">
                  Solo le enviaremos comunicaciones de marketing si ha dado su consentimiento explícito. 
                  Puede optar por no recibir estas comunicaciones en cualquier momento.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">11.2 Cómo Darse de Baja</h3>
                <p className="mb-4">Puede darse de baja de las comunicaciones de marketing:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Haciendo clic en el enlace "darse de baja" en cualquier correo electrónico</li>
                  <li>Contactándonos directamente en contacto@serviprogarcia.com</li>
                  <li>Actualizando sus preferencias en su cuenta de usuario</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Cambios en esta Política de Privacidad</h2>
              <p className="mb-4">
                Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en 
                nuestras prácticas o por otras razones operativas, legales o reglamentarias. Le notificaremos 
                sobre cambios significativos publicando la política actualizada en nuestro sitio web y 
                actualizando la fecha de "Última actualización".
              </p>
              <p className="mb-4">
                Le recomendamos que revise esta política periódicamente para estar informado sobre cómo 
                protegemos su información.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Información de Contacto</h2>
              <p className="mb-4">
                Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad 
                o nuestras prácticas de privacidad, puede contactarnos:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p><strong>ServiPro Garcia LLC</strong></p>
                <p><strong>Oficial de Privacidad</strong></p>    
                <p>Email general: contacto@serviprogarcia.com</p>
                <p>Sitio web: www.serviprogarcia.com</p>
              </div>
              <p className="mb-4">
                Nos esforzaremos por responder a su consulta dentro de un plazo razonable y, cuando sea 
                requerido por la ley aplicable, dentro de los plazos especificados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Recursos Adicionales</h2>
              <p className="mb-4">
                Para obtener más información sobre sus derechos de privacidad, puede consultar:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Comisión Federal de Comercio (FTC): ftc.gov</li>
                <li>Oficina del Fiscal General de California: oag.ca.gov</li>
                <li>Asociación Nacional de Mejores Negocios: bbb.org</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}