import Link from 'next/link';
import { QrCode, Utensils, BarChart3, Clock, MapPin, Smartphone } from 'lucide-react';

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
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Fiyatlar</a>
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              14 gün ücretsiz deneme. Kredi kartı gerekmez.
            </p>
            <Link
              href="/admin/register"
              className="inline-flex px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-2xl hover:shadow-orange-500/30"
            >
              Ücretsiz Hesap Oluştur
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">QResto</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 QResto. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
