import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, X, Wrench, Shield } from 'lucide-react';
import { MaintenanceAlert as MaintenanceAlertType } from '../../shared/types.js';
import { collectionsApi } from '@/services/api';
import AssignPersonnelModal from './AssignPersonnelModal';
import { Button } from './ui/Button';

export default function MaintenanceAlertModal() {
  const [alerts, setAlerts] = useState<MaintenanceAlertType[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await collectionsApi.getMaintenanceAlerts();
      if (response.success && response.data) {
        const urgentAlerts = (response.data as MaintenanceAlertType[]).filter(
          a => a.level === 'urgent' || a.level === 'overdue'
        );
        setAlerts(urgentAlerts);
        if (urgentAlerts.length > 0) {
          setIsVisible(true);
          setCurrentAlertIndex(0);
        }
      }
    } catch (error) {
      console.error('获取养护预警失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentAlertIndex < alerts.length - 1) {
      setCurrentAlertIndex(prev => prev + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handleAssign = (collectionId: number) => {
    setSelectedCollectionId(collectionId);
    setShowAssignModal(true);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'overdue': return 'text-accent-400 border-accent-500';
      case 'urgent': return 'text-amber-400 border-amber-500';
      default: return 'text-gold-400 border-gold-500';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'overdue': return 'bg-accent-500/20';
      case 'urgent': return 'bg-amber-500/20';
      default: return 'bg-gold-500/20';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'overdue': return '已逾期';
      case 'urgent': return '紧急';
      default: return '提醒';
    }
  };

  if (!isVisible || alerts.length === 0 || isLoading) return null;

  const currentAlert = alerts[currentAlertIndex];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 pointer-events-none">
        <div className="absolute inset-0 bg-primary-900/80 backdrop-blur-sm pointer-events-auto" onClick={handleClose} />
        
        <div 
          className={`relative w-full max-w-lg mx-4 pointer-events-auto animate-slide-up ${
            currentAlert.level === 'overdue' ? 'animate-pulse-border' : ''
          }`}
        >
          <div className={`relative overflow-hidden rounded-2xl border-2 ${getLevelColor(currentAlert.level)} ${getLevelBg(currentAlert.level)} shadow-2xl`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getLevelBg(currentAlert.level)}`}>
                    <AlertTriangle className={`w-6 h-6 ${getLevelColor(currentAlert.level).split(' ')[0]}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getLevelBg(currentAlert.level)} ${getLevelColor(currentAlert.level).split(' ')[0]}`}>
                        {getLevelText(currentAlert.level)}
                      </span>
                      <span className="text-cream-400 text-sm">
                        {currentAlertIndex + 1} / {alerts.length}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-cream-100 mt-1 font-serif">
                      养护预警
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-1 rounded-lg hover:bg-cream-100/10 text-cream-400 hover:text-cream-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-primary-800/50 rounded-xl p-4 mb-4">
                <h4 className="text-lg font-semibold text-cream-100 mb-2">
                  {currentAlert.collectionName}
                </h4>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-cream-300">
                    <Clock className="w-4 h-4" />
                    <span>下次养护：{currentAlert.nextMaintenanceDate}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${currentAlert.daysUntil < 0 ? 'text-accent-400' : 'text-amber-400'}`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      {currentAlert.daysUntil < 0 
                        ? `已逾期 ${Math.abs(currentAlert.daysUntil)} 天` 
                        : `还剩 ${currentAlert.daysUntil} 天`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  稍后处理
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => handleAssign(currentAlert.collectionId)}
                >
                  <Wrench className="w-4 h-4" />
                  分配修复师
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => handleAssign(currentAlert.collectionId)}
                >
                  <Shield className="w-4 h-4" />
                  分配安保
                </Button>
              </div>

              {alerts.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {alerts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentAlertIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentAlertIndex 
                          ? 'bg-gold-500 w-6' 
                          : 'bg-cream-600 hover:bg-cream-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAssignModal && selectedCollectionId && (
        <AssignPersonnelModal
          isOpen={showAssignModal}
          collectionId={selectedCollectionId}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedCollectionId(null);
            handleNext();
          }}
        />
      )}
    </>
  );
}
