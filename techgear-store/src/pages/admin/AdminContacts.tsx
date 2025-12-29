import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import './AdminContacts.css';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unanswered' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
}

export const AdminContacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unanswered' | 'in_progress' | 'completed'>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'unanswered' || status === 'in_progress' || status === 'completed') {
      setStatusFilter(status);
    }
  }, [searchParams]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isAdminUser = user.email?.includes('admin') || user.email === 'test@example.com';
    setIsAdmin(isAdminUser);

    if (isAdminUser) {
      await loadContacts();
    } else {
      navigate('/');
    }
  };

  const loadContacts = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const contactsRef = collection(db, 'contacts');
      const snapshot = await getDocs(contactsRef);
      const contactsData: Contact[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || 'unanswered',
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || undefined,
      } as Contact));

      setContacts(contactsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId: string, newStatus: Contact['status']) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, 'contacts', contactId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      setContacts(prev => prev.map(c =>
        c.id === contactId ? { ...c, status: newStatus, updatedAt: new Date() } : c
      ));

      if (selectedContact?.id === contactId) {
        setSelectedContact(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date() } : null);
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const saveNotes = async () => {
    if (!db || !selectedContact) return;

    try {
      await updateDoc(doc(db, 'contacts', selectedContact.id), {
        notes: notes,
        updatedAt: new Date(),
      });

      setContacts(prev => prev.map(c =>
        c.id === selectedContact.id ? { ...c, notes, updatedAt: new Date() } : c
      ));

      setSelectedContact(prev => prev ? { ...prev, notes, updatedAt: new Date() } : null);
      alert('メモを保存しました');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('メモの保存に失敗しました');
    }
  };

  const openDetailModal = (contact: Contact) => {
    setSelectedContact(contact);
    setNotes(contact.notes || '');
    setShowDetailModal(true);
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusStats = {
    all: contacts.length,
    unanswered: contacts.filter(c => c.status === 'unanswered').length,
    in_progress: contacts.filter(c => c.status === 'in_progress').length,
    completed: contacts.filter(c => c.status === 'completed').length,
  };

  const getStatusLabel = (status: Contact['status']) => {
    switch (status) {
      case 'unanswered': return '未回答';
      case 'in_progress': return '対応中';
      case 'completed': return '完了';
      default: return status;
    }
  };

  const getStatusClass = (status: Contact['status']) => {
    switch (status) {
      case 'unanswered': return 'admin-contacts__status--unanswered';
      case 'in_progress': return 'admin-contacts__status--in-progress';
      case 'completed': return 'admin-contacts__status--completed';
      default: return '';
    }
  };

  if (loading) {
    return <div className="admin-contacts__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-contacts">
      <div className="admin-contacts__header">
        <h1>問い合わせ管理</h1>
        <div className="admin-contacts__actions">
          <div className="admin-contacts__nav">
            <button onClick={() => navigate('/admin')}>ダッシュボード</button>
            <button onClick={() => navigate('/admin/products')}>商品管理</button>
            <button onClick={() => navigate('/admin/inventory')}>在庫管理</button>
            <button onClick={() => navigate('/admin/orders')}>注文管理</button>
          </div>
          <div className="admin-contacts__divider" />
          <div className="admin-contacts__page-actions">
            <button onClick={loadContacts}>更新</button>
          </div>
        </div>
      </div>

      {/* ステータスサマリー */}
      <div className="admin-contacts__summary">
        <div
          className={`admin-contacts__summary-card ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <span className="admin-contacts__summary-label">すべて</span>
          <span className="admin-contacts__summary-value">{statusStats.all}</span>
        </div>
        <div
          className={`admin-contacts__summary-card admin-contacts__summary-card--warning ${statusFilter === 'unanswered' ? 'active' : ''}`}
          onClick={() => setStatusFilter('unanswered')}
        >
          <span className="admin-contacts__summary-label">未回答</span>
          <span className="admin-contacts__summary-value">{statusStats.unanswered}</span>
        </div>
        <div
          className={`admin-contacts__summary-card admin-contacts__summary-card--caution ${statusFilter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setStatusFilter('in_progress')}
        >
          <span className="admin-contacts__summary-label">対応中</span>
          <span className="admin-contacts__summary-value">{statusStats.in_progress}</span>
        </div>
        <div
          className={`admin-contacts__summary-card admin-contacts__summary-card--success ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          <span className="admin-contacts__summary-label">完了</span>
          <span className="admin-contacts__summary-value">{statusStats.completed}</span>
        </div>
      </div>

      {/* 検索 */}
      <div className="admin-contacts__filters">
        <input
          type="text"
          placeholder="名前、メール、件名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-contacts__search"
        />
      </div>

      {/* 問い合わせ一覧 */}
      <div className="admin-contacts__list">
        {filteredContacts.length === 0 ? (
          <p className="admin-contacts__empty">問い合わせがありません</p>
        ) : (
          <table className="admin-contacts__table">
            <thead>
              <tr>
                <th>日時</th>
                <th>名前</th>
                <th>メール</th>
                <th>件名</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(contact => (
                <tr key={contact.id} className={contact.status === 'unanswered' ? 'admin-contacts__row--urgent' : ''}>
                  <td>{contact.createdAt.toLocaleDateString()} {contact.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{contact.name}</td>
                  <td>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </td>
                  <td className="admin-contacts__subject">{contact.subject}</td>
                  <td>
                    <span className={`admin-contacts__status ${getStatusClass(contact.status)}`}>
                      {getStatusLabel(contact.status)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-contacts__actions-cell">
                      <button
                        className="admin-contacts__btn admin-contacts__btn--view"
                        onClick={() => openDetailModal(contact)}
                      >
                        詳細
                      </button>
                      {contact.status !== 'completed' && (
                        <select
                          value={contact.status}
                          onChange={(e) => updateContactStatus(contact.id, e.target.value as Contact['status'])}
                          className="admin-contacts__status-select"
                        >
                          <option value="unanswered">未回答</option>
                          <option value="in_progress">対応中</option>
                          <option value="completed">完了</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 詳細モーダル */}
      {showDetailModal && selectedContact && (
        <div className="admin-contacts__modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-contacts__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-contacts__modal-header">
              <h2>問い合わせ詳細</h2>
              <button
                className="admin-contacts__modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="admin-contacts__modal-content">
              <div className="admin-contacts__detail-row">
                <label>ステータス</label>
                <select
                  value={selectedContact.status}
                  onChange={(e) => updateContactStatus(selectedContact.id, e.target.value as Contact['status'])}
                  className="admin-contacts__status-select"
                >
                  <option value="unanswered">未回答</option>
                  <option value="in_progress">対応中</option>
                  <option value="completed">完了</option>
                </select>
              </div>
              <div className="admin-contacts__detail-row">
                <label>受信日時</label>
                <span>{selectedContact.createdAt.toLocaleString()}</span>
              </div>
              <div className="admin-contacts__detail-row">
                <label>名前</label>
                <span>{selectedContact.name}</span>
              </div>
              <div className="admin-contacts__detail-row">
                <label>メールアドレス</label>
                <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
              </div>
              <div className="admin-contacts__detail-row">
                <label>件名</label>
                <span>{selectedContact.subject}</span>
              </div>
              <div className="admin-contacts__detail-row admin-contacts__detail-row--full">
                <label>本文</label>
                <div className="admin-contacts__message">{selectedContact.message}</div>
              </div>
              <div className="admin-contacts__detail-row admin-contacts__detail-row--full">
                <label>対応メモ</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="対応内容やメモを記録..."
                  className="admin-contacts__notes"
                  rows={4}
                />
                <button
                  className="admin-contacts__btn admin-contacts__btn--save"
                  onClick={saveNotes}
                >
                  メモを保存
                </button>
              </div>
              {selectedContact.updatedAt && (
                <div className="admin-contacts__detail-row">
                  <label>最終更新</label>
                  <span>{selectedContact.updatedAt.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="admin-contacts__modal-actions">
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                className="admin-contacts__btn admin-contacts__btn--reply"
              >
                メールで返信
              </a>
              <button
                className="admin-contacts__btn admin-contacts__btn--close"
                onClick={() => setShowDetailModal(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
