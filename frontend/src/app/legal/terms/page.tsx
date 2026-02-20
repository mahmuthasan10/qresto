import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları - QResto',
  description: 'QResto platformunun kullanım koşulları ve hükümler.',
};

export default function TermsPage() {
  return (
    <article className="prose prose-invert prose-orange max-w-none">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Kullanım Koşulları
      </h1>
      <p className="text-gray-400 text-sm mb-8">Son güncelleme: 20 Şubat 2026</p>

      <div className="space-y-8 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Genel Hükümler</h2>
          <p>
            Bu Kullanım Koşulları (&quot;Koşullar&quot;), QResto Teknoloji A.Ş. (&quot;QResto&quot;) tarafından sunulan
            dijital menü ve sipariş yönetim platformunun kullanımını düzenler. Platformumuza erişerek
            veya kullanarak bu Koşulları kabul etmiş sayılırsınız.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Tanımlar</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li><strong className="text-white">Platform:</strong> QResto web sitesi, yönetim paneli, dijital menü sistemi ve tüm ilgili hizmetler</li>
            <li><strong className="text-white">Restoran Sahibi:</strong> QResto&apos;ya kayıt olarak restoran hesabı oluşturan gerçek veya tüzel kişi</li>
            <li><strong className="text-white">Müşteri:</strong> QR kod aracılığıyla dijital menüye erişen restoran müşterisi</li>
            <li><strong className="text-white">Hizmet:</strong> Dijital menü görüntüleme, sipariş yönetimi, mutfak bildirimleri ve analiz araçları</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Hesap Oluşturma ve Güvenlik</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <h3 className="text-white font-medium mb-2">3.1. Kayıt Şartları</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>18 yaşından büyük olmanız gerekmektedir</li>
                <li>Geçerli bir e-posta adresi sağlamanız gerekmektedir</li>
                <li>Sağladığınız bilgilerin doğru ve güncel olması zorunludur</li>
                <li>Her restoran için yalnızca bir hesap oluşturulabilir</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <h3 className="text-white font-medium mb-2">3.2. Hesap Güvenliği</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Hesap şifrenizi güvenli tutmak sizin sorumluluğunuzdadır</li>
                <li>Hesabınızda gerçekleşen tüm işlemlerden siz sorumlusunuz</li>
                <li>Yetkisiz erişim tespit ettiğinizde derhal bizi bilgilendirmelisiniz</li>
                <li>QResto, güvenlik ihlali şüphesinde hesabı geçici olarak askıya alabilir</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Hizmet Kapsamı</h2>
          <p>QResto platformu aşağıdaki hizmetleri sunar:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>QR kod ile dijital menü oluşturma ve yönetme</li>
            <li>Masa bazlı sipariş alma ve takip etme</li>
            <li>Mutfak ekranında anlık sipariş bildirimleri (Socket.io)</li>
            <li>Lokasyon doğrulaması ile sahte sipariş kontrolü</li>
            <li>Temel satış analizi ve raporlama</li>
            <li>Masalar arası ikram (treat) sistemi</li>
            <li>Tema özelleştirme</li>
            <li>QR kod indirme ve yazdırma</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Kullanım Kuralları</h2>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <h3 className="text-white font-medium mb-2">5.1. Kabul Edilebilir Kullanım</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Platformu yalnızca restoran işletmeciliği amacıyla kullanabilirsiniz</li>
                <li>Menü içeriklerinin doğru ve güncel olmasını sağlamalısınız</li>
                <li>Fiyatlandırmanın yasal düzenlemelere uygun olması zorunludur</li>
                <li>Gıda alerjenleri ve diyet bilgilerini doğru belirtmelisiniz</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <h3 className="text-white font-medium mb-2">5.2. Yasaklanan Kullanımlar</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Platformu yasa dışı amaçlarla kullanmak</li>
                <li>Başka restoranların verilerine erişmeye çalışmak</li>
                <li>Sistemi aşırı yüklemek veya kötüye kullanmak (DDoS, spam vb.)</li>
                <li>Sahte restoran veya menü bilgileri yayınlamak</li>
                <li>API&apos;yi izinsiz veya aşırı şekilde kullanmak</li>
                <li>Fikri mülkiyet haklarını ihlal eden içerik yüklemek</li>
                <li>Diğer kullanıcıların hizmetini engellemek</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Fiyatlandırma ve Ödeme</h2>
          <p>
            Beta dönemi boyunca QResto platformu <strong className="text-orange-400">tamamen ücretsizdir</strong>.
            Tüm özellikler sınırsız olarak kullanılabilir.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 mt-2">
            <li>Beta döneminin sona erme tarihi önceden duyurulacaktır</li>
            <li>Beta sonrasında ücretli planlara geçiş yapılacaktır</li>
            <li>Mevcut beta kullanıcılarına özel indirimler sağlanacaktır</li>
            <li>Ücretli dönemde en az 30 gün önceden bilgilendirme yapılacaktır</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Fikri Mülkiyet</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>QResto platformunun tasarımı, kodu ve markası QResto Teknoloji A.Ş.&apos;ye aittir</li>
            <li>Restoran sahipleri, yükledikleri içeriklerin (menü, görseller) haklarını korur</li>
            <li>QResto&apos;ya yüklenen içerikler için platformda gösterim lisansı verilmiş sayılır</li>
            <li>Hesap silindiğinde içerikler makul süre içinde sistemden kaldırılır</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Sorumluluk Sınırlaması</h2>
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>QResto, platformun kesintisiz veya hatasız çalışacağını garanti etmez</li>
              <li>Sipariş iletimindeki gecikmelerden kaynaklanan doğrudan zararlardan sorumlu tutulamaz</li>
              <li>İnternet bağlantısı sorunlarından kaynaklanan aksaklıklardan sorumlu değildir</li>
              <li>Restoran sahibinin menü bilgilerinin doğruluğundan QResto sorumlu değildir</li>
              <li>Gıda güvenliği ve hijyen restoran sahibinin sorumluluğundadır</li>
              <li>Platform üzerinden verilen siparişlerin tesliminden restoran sorumludur</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Hizmet Seviyesi</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>QResto, platformun %99.5 erişilebilirlik oranını hedefler</li>
            <li>Planlı bakım çalışmaları önceden duyurulacaktır</li>
            <li>Acil güvenlik güncellemeleri bildirim olmaksızın uygulanabilir</li>
            <li>Teknik destek e-posta ve WhatsApp üzerinden sağlanır</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Hesap Fesih ve Askıya Alma</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Hesabınızı istediğiniz zaman kapatabilirsiniz</li>
            <li>Kullanım kurallarının ihlali halinde QResto hesabınızı askıya alabilir veya kapatabilir</li>
            <li>Hesap kapatıldığında verileriniz 30 gün içinde silinir</li>
            <li>Yasal zorunluluklar gereği bazı veriler daha uzun süre tutulabilir</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">11. Uyuşmazlık Çözümü</h2>
          <p>
            Bu Koşullardan doğan uyuşmazlıklarda Türkiye Cumhuriyeti yasaları uygulanır.
            Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">12. Değişiklikler</h2>
          <p>
            QResto bu Kullanım Koşullarını önceden bildirimde bulunarak değiştirebilir.
            Önemli değişiklikler en az 15 gün önceden e-posta ile bildirilecektir.
            Değişikliklerden sonra platformu kullanmaya devam etmeniz, yeni koşulları
            kabul ettiğiniz anlamına gelir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">13. İletişim</h2>
          <p>Bu Koşullar hakkında sorularınız için:</p>
          <div className="mt-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
            <p><strong className="text-white">QResto Teknoloji A.Ş.</strong></p>
            <p>E-posta: legal@qresto.app</p>
            <p>Genel: info@qresto.app</p>
            <p>Telefon: +90 (500) 123 45 67</p>
          </div>
        </section>
      </div>
    </article>
  );
}
