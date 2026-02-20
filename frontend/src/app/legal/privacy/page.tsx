import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası - QResto',
  description: 'QResto gizlilik politikası - Verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında bilgi.',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert prose-orange max-w-none">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Gizlilik Politikası
      </h1>
      <p className="text-gray-400 text-sm mb-8">Son güncelleme: 20 Şubat 2026</p>

      <div className="space-y-8 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Giriş</h2>
          <p>
            QResto Teknoloji A.Ş. (&quot;QResto&quot;, &quot;biz&quot;, &quot;bizim&quot;) olarak gizliliğinize önem veriyoruz. Bu Gizlilik
            Politikası, QResto platformunu (web sitesi, yönetim paneli ve dijital menü sistemi) kullanırken
            kişisel bilgilerinizin nasıl toplandığını, kullanıldığını, paylaşıldığını ve korunduğunu açıklar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Topladığımız Bilgiler</h2>

          <div className="space-y-4 mt-3">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <h3 className="text-white font-medium mb-2">2.1. Doğrudan Sağladığınız Bilgiler</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Hesap oluştururken: İşletme adı, e-posta, telefon, adres</li>
                <li>Restoran ayarlarında: Lokasyon koordinatları, logo, tema tercihleri</li>
                <li>Menü yönetiminde: Ürün adları, açıklamaları, fiyatları, görselleri</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <h3 className="text-white font-medium mb-2">2.2. Otomatik Toplanan Bilgiler</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Konum verisi: Sipariş doğrulaması için müşterinin anlık GPS konumu (50m yarıçap kontrolü)</li>
                <li>Cihaz bilgileri: Tarayıcı türü, işletim sistemi, ekran boyutu</li>
                <li>Kullanım verileri: Sayfa görüntüleme, sipariş geçmişi, oturum süreleri</li>
                <li>Teknik veriler: IP adresi, erişim zamanı, hata günlükleri</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <h3 className="text-white font-medium mb-2">2.3. Toplamadığımız Bilgiler</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Ödeme/kredi kartı bilgileri (beta döneminde online ödeme yoktur)</li>
                <li>Müşteri kimlik bilgileri (müşteriler hesap oluşturmaz)</li>
                <li>Sürekli konum takibi (yalnızca sipariş anında, tek seferlik)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Bilgilerin Kullanım Amaçları</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li><strong className="text-white">Hizmet sunumu:</strong> Dijital menü görüntüleme, sipariş alma ve yönetme</li>
            <li><strong className="text-white">Güvenlik:</strong> Lokasyon doğrulaması ile sahte sipariş önleme</li>
            <li><strong className="text-white">Oturum yönetimi:</strong> Masa bazlı oturum kontrolü (maks. 30 dakika)</li>
            <li><strong className="text-white">Analiz:</strong> Satış raporları, popüler ürün istatistikleri (restoran sahiplerine)</li>
            <li><strong className="text-white">İyileştirme:</strong> Platform performansı ve kullanıcı deneyiminin geliştirilmesi</li>
            <li><strong className="text-white">İletişim:</strong> Teknik destek, güncelleme bildirimleri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Bilgilerin Paylaşımı</h2>
          <p>Kişisel bilgilerinizi satmıyor veya kiralamıyoruz. Aşağıdaki durumlar dışında üçüncü taraflarla paylaşmıyoruz:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li><strong className="text-white">Altyapı sağlayıcıları:</strong> Railway (sunucu), Cloudinary (görsel barındırma), PostgreSQL (veritabanı)</li>
            <li><strong className="text-white">Restoran sahipleri:</strong> Yalnızca kendi restoranlarıyla ilgili sipariş ve analiz verileri</li>
            <li><strong className="text-white">Yasal zorunluluklar:</strong> Mahkeme kararı veya yasal talep halinde</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Veri Güvenliği</h2>
          <p>Verilerinizi korumak için aşağıdaki güvenlik önlemlerini uyguluyoruz:</p>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            {[
              { title: 'Şifreleme', desc: 'SSL/TLS ile tüm veri iletişimi şifrelenir' },
              { title: 'Kimlik Doğrulama', desc: 'JWT tabanlı güvenli kimlik doğrulama' },
              { title: 'Şifre Güvenliği', desc: 'bcrypt ile tek yönlü şifre hash\'leme' },
              { title: 'Rate Limiting', desc: 'Brute force saldırılarına karşı istek sınırlama' },
              { title: 'Multi-tenancy', desc: 'Restoran verileri birbirinden tamamen izole' },
              { title: 'Erişim Kontrolü', desc: 'Rol bazlı yetkilendirme sistemi' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <h4 className="text-white font-medium text-sm">{item.title}</h4>
                <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Çerezler ve Yerel Depolama</h2>
          <p>
            QResto, üçüncü taraf izleme çerezleri kullanmaz. Aşağıdaki teknik veriler tarayıcınızın
            yerel deposunda (localStorage) saklanır:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>Kimlik doğrulama tokenları (oturum yönetimi)</li>
            <li>Sepet içeriği (sipariş tamamlanana kadar)</li>
            <li>Dil tercihi (TR/EN)</li>
            <li>Tema ayarları</li>
          </ul>
          <p className="mt-2">
            Bu veriler yalnızca hizmet sunumu için gereklidir ve tarayıcınızın ayarlarından silinebilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Konum Verisi</h2>
          <p>
            QResto, müşterilerin sipariş verirken gerçekten restoranda bulunduğunu doğrulamak için
            anlık GPS konumu kullanır. Bu konuya ilişkin önemli noktalar:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>Konum izni tarayıcı tarafından açıkça istenir</li>
            <li>Yalnızca sipariş doğrulama anında tek seferlik kullanılır</li>
            <li>Konum koordinatları veritabanında <strong className="text-white">saklanmaz</strong></li>
            <li>Varsayılan doğrulama yarıçapı 50 metredir</li>
            <li>Konum izni verilmezse sipariş verilemez (güvenlik gereksinimi)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Veri Saklama Süreleri</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-white font-medium">Veri Türü</th>
                  <th className="text-left py-3 px-4 text-white font-medium">Saklama Süresi</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-gray-800"><td className="py-3 px-4">Konum verisi</td><td className="py-3 px-4">Saklanmaz (anlık doğrulama)</td></tr>
                <tr className="border-b border-gray-800"><td className="py-3 px-4">Oturum verileri</td><td className="py-3 px-4">Maks. 30 dakika</td></tr>
                <tr className="border-b border-gray-800"><td className="py-3 px-4">Sipariş verileri</td><td className="py-3 px-4">1 yıl</td></tr>
                <tr className="border-b border-gray-800"><td className="py-3 px-4">Hesap bilgileri</td><td className="py-3 px-4">Hesap silinene kadar</td></tr>
                <tr className="border-b border-gray-800"><td className="py-3 px-4">Log kayıtları</td><td className="py-3 px-4">6 ay</td></tr>
                <tr><td className="py-3 px-4">Analiz verileri</td><td className="py-3 px-4">Anonim, süresiz</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Haklarınız</h2>
          <p>KVKK ve ilgili mevzuat kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>Verilerinize erişim talep etme</li>
            <li>Verilerinizin düzeltilmesini isteme</li>
            <li>Verilerinizin silinmesini isteme</li>
            <li>Veri işlemeye itiraz etme</li>
            <li>Veri taşınabilirliği talep etme</li>
          </ul>
          <p className="mt-2">
            Bu haklarınızı kullanmak için{' '}
            <a href="mailto:privacy@qresto.app" className="text-orange-400 hover:text-orange-300">privacy@qresto.app</a>{' '}
            adresine başvurabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Çocukların Gizliliği</h2>
          <p>
            QResto, 18 yaşın altındaki bireylere doğrudan hizmet vermez. Restoran hesapları yalnızca
            yetişkin işletme sahipleri tarafından oluşturulabilir. Müşteri menü erişimi anonim olup
            yaş doğrulaması gerektirmez.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">11. Politika Değişiklikleri</h2>
          <p>
            Bu Gizlilik Politikası&apos;nı zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda
            kayıtlı kullanıcılarımızı e-posta ile bilgilendireceğiz. Güncel politika her zaman bu
            sayfada yayınlanacaktır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">12. İletişim</h2>
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
            <p><strong className="text-white">QResto Teknoloji A.Ş.</strong></p>
            <p>Gizlilik soruları: privacy@qresto.app</p>
            <p>KVKK talepleri: kvkk@qresto.app</p>
            <p>Genel: info@qresto.app</p>
            <p>Telefon: +90 (500) 123 45 67</p>
          </div>
        </section>
      </div>
    </article>
  );
}
