import { useState, useEffect } from 'react';
import { AlertCircle, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';
import api from '../lib/api';

interface Banner {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
}

export default function CompanyBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await api.get('/banners');
      setBanners(response.data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  const dismissBanner = (id: string) => {
    setDismissed([...dismissed, id]);
    localStorage.setItem('dismissedBanners', JSON.stringify([...dismissed, id]));
  };

  useEffect(() => {
    const stored = localStorage.getItem('dismissedBanners');
    if (stored) {
      setDismissed(JSON.parse(stored));
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-900 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-900 border-red-200';
      case 'announcement':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-900 border-blue-200';
    }
  };

  const activeBanners = banners.filter(b => !dismissed.includes(b.id));

  if (activeBanners.length === 0) return null;

  return (
    <div className="space-y-2">
      {activeBanners.map((banner) => (
        <div
          key={banner.id}
          className={`border rounded-lg p-4 flex items-start space-x-3 shadow-sm ${getStyles(banner.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(banner.type)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{banner.title}</h3>
            <p className="text-sm opacity-90">{banner.content}</p>
          </div>
          <button
            onClick={() => dismissBanner(banner.id)}
            className="flex-shrink-0 hover:opacity-70 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
