import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni - QResto',
  description: 'QResto KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.',
};

export default function KVKKPage() {
  return (
    <article className="prose prose-invert prose-orange max-w-none">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        KVKK Aydınlatma Metni
      </h1>
      <p className="text-gray-400 text-sm mb-8">Son güncelleme: 20 Şubat 2026</p>

      <div className="space-y-8 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz; veri
            sorumlusu olarak <strong className="text-white">QResto Teknoloji A.Ş.</strong> (&quot;QResto&quot; veya &quot;Şirket&quot;) tarafından aşağıda
            açıklanan kapsamda işlenebilecektir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. İşlenen Kişisel Veriler</h2>
          <p>QResto platformu kapsamında aşağıdaki kişisel veriler işlenmektedir:</p>
          <div className="mt-3 space-y-3">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <h3 className="text-white font-medium mb-2">Restoran Sahipleri / Yöneticileri</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Kimlik bilgileri: Ad, soyad, e-posta adresi</li>
                <li>İletişim bilgileri: Telefon numarası, adres</li>
                <li>İşlem güvenliği: IP adresi, oturum bilgileri, şifreli erişim kayıtları</li>
                <li>Restoran bilgileri: İşletme adı, lokasyon (enlem/boylam)</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <h3 className="text-white font-medium mb-2">Müşteriler (Menü Kullanıcıları)</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Konum bilgileri: Sipariş doğrulaması için anlık GPS verisi</li>
                <li>Sipariş bilgileri: Sipariş detayları, masa numarası, oturum bilgisi</li>
                <li>Tarayıcı bilgileri: User-agent, dil tercihi (localStorage)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Dijital menü ve sipariş hizmetlerinin sunulması</li>
            <li>Lokasyon doğrulaması ile sahte sipariş önleme</li>
            <li>Oturum yönetimi ve güvenliğin sağlanması</li>
            <li>Restoran yönetim paneli hizmetlerinin sağlanması</li>
            <li>Analiz ve raporlama (anonim istatistikler)</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Hizmet kalitesinin iyileştirilmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Kişisel Verilerin İşlenme Hukuki Sebebi</h2>
          <p>Kişisel verileriniz KVKK&apos;nın 5. ve 6. maddelerinde belirtilen şu hukuki sebeplere dayanarak işlenmektedir:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (hizmet sunumu)</li>
            <li>Veri sorumlusunun meşru menfaati (güvenlik, analiz)</li>
            <li>Hukuki yükümlülüğün yerine getirilmesi</li>
            <li>İlgili kişinin açık rızası (konum verisi)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Kişisel Verilerin Aktarılması</h2>
          <p>Kişisel verileriniz aşağıdaki durumlarda üçüncü kişilere aktarılabilir:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>Yasal zorunluluklar kapsamında kamu kurum ve kuruluşlarına</li>
            <li>Hizmet sağlayıcılarımıza (sunucu altyapısı: Railway, görsel depolama: Cloudinary)</li>
            <li>Restoran sahiplerine (yalnızca kendi restoranlarıyla ilgili sipariş verileri)</li>
          </ul>
          <p className="mt-2">
            Verileriniz yurt dışına aktarılabilir (bulut altyapı hizmetleri). Bu aktarım KVKK&apos;nın 9. maddesi
            kapsamında gerekli güvenlik önlemleri alınarak gerçekleştirilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Veri Saklama Süresi</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Oturum verileri: Oturum süresi boyunca (maksimum 30 dakika)</li>
            <li>Konum verileri: Sipariş doğrulaması anında, saklanmaz</li>
            <li>Sipariş verileri: 1 yıl</li>
            <li>Restoran hesap bilgileri: Hesap aktif olduğu sürece</li>
            <li>Log kayıtları: 6 ay</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Veri Sahibinin Hakları</h2>
          <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmesi halinde bunların düzeltilmesini isteme</li>
            <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Başvuru Yöntemi</h2>
          <p>
            Yukarıda belirtilen haklarınızı kullanmak için{' '}
            <a href="mailto:kvkk@qresto.app" className="text-orange-400 hover:text-orange-300">kvkk@qresto.app</a>{' '}
            adresine e-posta gönderebilir veya aşağıdaki iletişim bilgilerini kullanabilirsiniz:
          </p>
          <div className="mt-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
            <p><strong className="text-white">QResto Teknoloji A.Ş.</strong></p>
            <p>E-posta: kvkk@qresto.app</p>
            <p>Genel: info@qresto.app</p>
            <p>Telefon: +90 (500) 123 45 67</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Çerez Kullanımı</h2>
          <p>
            QResto platformu teknik olarak zorunlu çerezler ve localStorage kullanmaktadır. Bu veriler
            yalnızca hizmet sunumu için gereklidir ve üçüncü taraflarla paylaşılmaz.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>Oturum yönetimi (JWT token)</li>
            <li>Dil tercihi</li>
            <li>Sepet bilgileri</li>
            <li>Tema tercihleri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Değişiklikler</h2>
          <p>
            Bu aydınlatma metni gerektiğinde güncellenebilir. Güncel metin her zaman bu sayfada
            yayınlanacaktır. Önemli değişiklikler için kayıtlı kullanıcılarımıza e-posta bildirimi gönderilecektir.
          </p>
        </section>
      </div>
    </article>
  );
}
