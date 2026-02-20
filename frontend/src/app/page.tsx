import Link from 'next/link';
import { QrCode, Utensils, BarChart3, Clock, MapPin, Smartphone, ScanLine, ShoppingCart, ChefHat, ChevronDown, Mail, Phone, MessageSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">QResto</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Özellikler</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">Nasıl Çalışır</a>
              <a href="#faq" className="text-gray-300 hover:text-white transition-colors">SSS</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">İletişim</a>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/admin/register"
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-orange-500/25"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-orange-400 text-sm font-medium">Türkiye&apos;nin 1 numaralı QR menü sistemi</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Restoranınızı
            <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Dijitalleştirin
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            QR kod ile sipariş, lokasyon bazlı güvenlik ve anlık mutfak bildirimleri.
            5 dakikada kurulum, aylık sadece ₺349&apos;dan başlayan fiyatlar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-2xl hover:shadow-orange-500/30 hover:scale-105"
            >
              14 Gün Ücretsiz Dene
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 rounded-xl border-2 border-gray-600 text-white font-semibold text-lg hover:bg-gray-800 transition-all"
            >
              Demo İncele
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Neden QResto?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Rakiplerden farklı, Türkiye&apos;ye özel çözümler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">50m Lokasyon Kontrolü</h3>
              <p className="text-gray-400">
                Sahte siparişleri engelleyin. Sadece restoranda bulunan müşteriler sipariş verebilir.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">30 Dakika Oturum Limiti</h3>
              <p className="text-gray-400">
                Masa devir hızınızı artırın. Otomatik oturum sonlandırma ile verimlilik sağlayın.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Anlık Bildirimler</h3>
              <p className="text-gray-400">
                Mutfak ekranına gerçek zamanlı sipariş akışı. Ses uyarısı ile hiçbir siparişi kaçırmayın.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Utensils className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Görsel Menü</h3>
              <p className="text-gray-400">
                Yüksek kaliteli ürün fotoğrafları, alerjen bilgileri ve çoklu dil desteği.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Detaylı Raporlar</h3>
              <p className="text-gray-400">
                Satış trendleri, popüler ürünler ve müşteri analizi. Veriye dayalı kararlar alın.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">5 Dakikada Kurulum</h3>
              <p className="text-gray-400">
                Teknik bilgi gerektirmez. Kayıt ol, menünü ekle, QR kodları indir ve başla!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nasıl Çalışıyor?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              3 basit adımda siparişler dijitalleşsin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-orange-500/50 via-orange-500 to-orange-500/50" />

            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 relative z-10">
                <ScanLine className="w-8 h-8 text-white" />
              </div>
              <div className="text-orange-400 font-bold text-sm mb-2">ADIM 1</div>
              <h3 className="text-xl font-semibold text-white mb-3">QR Kodu Okut</h3>
              <p className="text-gray-400">
                Müşteri masadaki QR kodu telefonuyla okutarak menüye anında erişir. Uygulama indirmeye gerek yok.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 relative z-10">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div className="text-orange-400 font-bold text-sm mb-2">ADIM 2</div>
              <h3 className="text-xl font-semibold text-white mb-3">Sipariş Ver</h3>
              <p className="text-gray-400">
                Görsel menüden ürünleri seçip sepete eklesin, notlarını yazıp siparişini onaylasın.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 relative z-10">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div className="text-orange-400 font-bold text-sm mb-2">ADIM 3</div>
              <h3 className="text-xl font-semibold text-white mb-3">Mutfakta Görünsün</h3>
              <p className="text-gray-400">
                Sipariş anında mutfak ekranına düşer. Ses uyarısıyla hiçbir sipariş kaçmaz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Kurulum zor mu? Teknik bilgi gerekiyor mu?',
                a: 'Hayır, hiç teknik bilgi gerektirmez. Kayıt olun, menünüzü ekleyin, QR kodlarınızı indirip masalara koyun. 5 dakikada hazırsınız.',
              },
              {
                q: 'Müşterilerim uygulama indirmek zorunda mı?',
                a: 'Hayır. QResto tamamen web tabanlıdır. Müşterileriniz QR kodu okuttuktan sonra tarayıcıda menüye erişir, herhangi bir uygulama indirmeye gerek yoktur.',
              },
              {
                q: 'İnternet kesilirse ne olur?',
                a: 'QResto PWA teknolojisi kullanır. Menü sayfası offline çalışabilir. İnternet geldiğinde siparişler otomatik iletilir.',
              },
              {
                q: 'Kaç masa destekleniyor?',
                a: 'Beta döneminde masa sayısında bir sınırlama yoktur. İhtiyacınız kadar masa oluşturabilir ve her birine özel QR kod indirebilirsiniz.',
              },
              {
                q: 'Ödeme nasıl alınıyor?',
                a: 'Beta aşamasında online ödeme entegrasyonu bulunmuyor. Siparişler dijital olarak alınır, ödeme mevcut yönteminizle (nakit/POS) yapılır. Online ödeme yakında eklenecektir.',
              },
              {
                q: 'Verilerim güvende mi?',
                a: 'Evet. Tüm veriler şifreli bağlantılarla (SSL) iletilir, lokasyon doğrulamasıyla sahte siparişler engellenir ve oturum süreleri sınırlıdır.',
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-gray-800/50 border border-gray-700/50 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="text-white font-medium text-lg pr-4">{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-400">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Beta Application Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Beta Programına Katılın
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Sorularınız mı var? Bize ulaşın veya hemen ücretsiz hesabınızı oluşturun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">E-posta</h3>
                  <a href="mailto:info@qresto.app" className="text-gray-400 hover:text-orange-400 transition-colors">
                    info@qresto.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Telefon</h3>
                  <a href="tel:+905001234567" className="text-gray-400 hover:text-orange-400 transition-colors">
                    +90 (500) 123 45 67
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">WhatsApp</h3>
                  <a href="https://wa.me/905001234567" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                    WhatsApp ile yazın
                  </a>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 flex flex-col justify-center text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Hemen Başlayın</h3>
              <p className="text-gray-400 mb-8">
                14 gün ücretsiz deneme. Kredi kartı gerekmez. Beta döneminde tüm özellikler ücretsiz.
              </p>
              <Link
                href="/admin/register"
                className="inline-flex justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-2xl hover:shadow-orange-500/30"
              >
                Ücretsiz Hesap Oluştur
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">QResto</span>
              </div>
              <p className="text-gray-500 text-sm">
                Restoranlar için dijital QR menü ve sipariş yönetim sistemi.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Hızlı Linkler</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">Özellikler</a>
                <a href="#how-it-works" className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">Nasıl Çalışır</a>
                <a href="#faq" className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">SSS</a>
                <a href="#contact" className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">İletişim</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Yasal</h4>
              <div className="space-y-2">
                <Link href="/legal/kvkk" className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">KVKK Aydınlatma Metni</Link>
                <Link href="/legal/privacy" className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">Gizlilik Politikası</Link>
                <Link href="/legal/terms" className="block text-gray-400 hover:text-orange-400 transition-colors text-sm">Kullanım Koşulları</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 QResto. Tüm hakları saklıdır.
            </p>
            <p className="text-gray-500 text-sm">
              info@qresto.app · +90 (500) 123 45 67
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
