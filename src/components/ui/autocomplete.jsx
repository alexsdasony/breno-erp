import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Autocomplete = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Selecione uma opção...',
  searchKey = 'name',
  displayKey = 'name',
  valueKey = 'id',
  className = '',
  disabled = false,
  required = false,
  label = '',
  error = false,
  errorMessage = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Encontrar opção selecionada baseada no value
  useEffect(() => {
    if (value) {
      const found = options.find(option => option[valueKey] === value);
      setSelectedOption(found || null);
      setSearchTerm(found ? found[displayKey] : '');
    } else {
      setSelectedOption(null);
      setSearchTerm('');
    }
  }, [value, options, valueKey, displayKey]);

  // Filtrar opções baseado no termo de busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option[searchKey].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, searchKey]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // Se o usuário limpar o campo, resetar seleção
    if (!newValue) {
      setSelectedOption(null);
      onChange('');
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setSearchTerm(option[displayKey]);
    setIsOpen(false);
    onChange(option[valueKey]);
  };

  const handleClear = () => {
    setSelectedOption(null);
    setSearchTerm('');
    setIsOpen(false);
    onChange('');
    inputRef.current?.focus();
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div 
        ref={dropdownRef}
        className={`relative w-full ${error ? 'border-red-500' : 'border-border'}`}
      >
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full p-3 pr-10 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
            } ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {selectedOption && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-muted-foreground/10 rounded-full transition-colors"
                title="Limpar seleção"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button
              type="button"
              onClick={handleToggle}
              disabled={disabled}
              className="p-1 hover:bg-muted-foreground/10 rounded-full transition-colors"
            >
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground">
                    {searchTerm ? 'Nenhuma opção encontrada' : 'Nenhuma opção disponível'}
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <button
                      key={option[valueKey] || index}
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full px-3 py-2 text-left hover:bg-muted transition-colors ${
                        selectedOption && selectedOption[valueKey] === option[valueKey]
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground'
                      }`}
                    >
                      <div className="font-medium">{option[displayKey]}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default Autocomplete; 