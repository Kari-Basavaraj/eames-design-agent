import React, { useState } from 'react';
import { Camera, Users, DollarSign, Receipt, Clock, Send } from 'lucide-react';

const SplitBillFeature = () => {
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [participants, setParticipants] = useState([]);
  const [description, setDescription] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  const contacts = [
    { id: 1, name: 'Maya Chen', avatar: 'MC', balance: '+$12.50' },
    { id: 2, name: 'Jordan Williams', avatar: 'JW', balance: '-$8.00' },
    { id: 3, name: 'Alex Martinez', avatar: 'AM', balance: '$0.00' },
    { id: 4, name: 'Sam Patel', avatar: 'SP', balance: '+$25.00' },
  ];

  const savedGroups = [
    { id: 'g1', name: '🏠 Roommates', count: 5 },
    { id: 'g2', name: '📚 Study Group', count: 4 },
    { id: 'g3', name: '🎾 Tennis Team', count: 8 },
  ];

  const calculateSplit = () => {
    if (!amount || participants.length === 0) return 0;
    return (parseFloat(amount) / (participants.length + 1)).toFixed(2);
  };

  const toggleParticipant = (contact) => {
    setParticipants(prev =>
      prev.find(p => p.id === contact.id)
        ? prev.filter(p => p.id !== contact.id)
        : [...prev, contact]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            className="text-gray-600 font-medium"
            aria-label="Cancel split bill creation"
          >
            Cancel
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Split Bill</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Amount Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Amount
          </label>
          <div className="relative">
            <DollarSign
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={24}
              aria-hidden="true"
            />
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-4 text-3xl font-semibold text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition"
              aria-label="Enter total bill amount in dollars"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <button
              className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
              aria-label="Scan receipt with camera"
            >
              <Camera size={20} className="text-blue-600 mb-1" />
              <span className="text-xs font-medium text-blue-700">Scan</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
              aria-label="View itemized receipt"
            >
              <Receipt size={20} className="text-blue-600 mb-1" />
              <span className="text-xs font-medium text-blue-700">Itemize</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
              aria-label="Create recurring split"
            >
              <Clock size={20} className="text-blue-600 mb-1" />
              <span className="text-xs font-medium text-blue-700">Repeat</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's this for?
          </label>
          <div className="relative">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dinner at Olive Garden 🍝"
              maxLength={140}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition"
              aria-label="Enter description for this split"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {description.length}/140
            </span>
          </div>
        </div>

        {/* Split Type Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How to split?
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSplitType('equal')}
              className={`py-3 px-4 rounded-xl font-medium transition ${
                splitType === 'equal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Split equally among all participants"
              aria-pressed={splitType === 'equal'}
            >
              Equal
            </button>
            <button
              onClick={() => setSplitType('custom')}
              className={`py-3 px-4 rounded-xl font-medium transition ${
                splitType === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Split with custom amounts per person"
              aria-pressed={splitType === 'custom'}
            >
              Custom
            </button>
            <button
              onClick={() => setSplitType('percentage')}
              className={`py-3 px-4 rounded-xl font-medium transition ${
                splitType === 'percentage'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Split by percentage"
              aria-pressed={splitType === 'percentage'}
            >
              Percent
            </button>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">
              Split with ({participants.length} selected)
            </label>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-blue-600 font-medium text-sm hover:text-blue-700"
              aria-expanded={showParticipants}
              aria-label={showParticipants ? "Hide participant list" : "Show participant list"}
            >
              {showParticipants ? 'Done' : 'Add'}
            </button>
          </div>

          {/* Selected Participants Preview */}
          {participants.length > 0 && !showParticipants && (
            <div className="flex flex-wrap gap-2 mb-3">
              {participants.map(person => (
                <div
                  key={person.id}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-medium"
                >
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {person.avatar}
                  </div>
                  {person.name.split(' ')[0]}
                </div>
              ))}
            </div>
          )}

          {/* Participant Selection UI */}
          {showParticipants && (
            <div className="space-y-4">
              {/* Saved Groups */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Quick Groups
                </h3>
                <div className="space-y-2">
                  {savedGroups.map(group => (
                    <button
                      key={group.id}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                      aria-label={`Select ${group.name} group with ${group.count} members`}
                    >
                      <span className="font-medium text-gray-900">{group.name}</span>
                      <span className="text-sm text-gray-500">{group.count} people</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Contacts */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Recent Contacts
                </h3>
                <div className="space-y-2">
                  {contacts.map(contact => {
                    const isSelected = participants.find(p => p.id === contact.id);
                    return (
                      <button
                        key={contact.id}
                        onClick={() => toggleParticipant(contact)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition ${
                          isSelected
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                        aria-label={`${isSelected ? 'Remove' : 'Add'} ${contact.name}, current balance ${contact.balance}`}
                        aria-pressed={!!isSelected}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                          }`}>
                            {contact.avatar}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{contact.name}</div>
                            <div className={`text-xs ${
                              contact.balance.startsWith('+') ? 'text-green-600' :
                              contact.balance.startsWith('-') ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              Balance: {contact.balance}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calculation Preview */}
        {amount && participants.length > 0 && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-center mb-4">
              <div className="text-sm font-medium opacity-90 mb-1">Each person pays</div>
              <div className="text-4xl font-bold">${calculateSplit()}</div>
            </div>
            <div className="border-t border-blue-500 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-90">You + {participants.length} others</span>
                <span className="font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-90">You'll receive</span>
                <span className="font-semibold text-green-300">
                  ${(parseFloat(amount) - parseFloat(calculateSplit())).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            disabled={!amount || participants.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md"
            aria-label="Send split bill request to selected participants"
          >
            <Send size={20} aria-hidden="true" />
            Send Split Request
          </button>
          {(!amount || participants.length === 0) && (
            <p className="text-center text-sm text-gray-500 mt-2" role="status" aria-live="polite">
              {!amount ? 'Enter an amount' : 'Add at least one person'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitBillFeature;
