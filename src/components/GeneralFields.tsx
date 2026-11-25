import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AuditFields } from '../types/audit';
import { Store, User, Users, ShoppingBag, Briefcase, Play, X, ChevronDown, Check } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

interface GeneralFieldsProps {
  fields: AuditFields;
  onFieldChange: (field: keyof AuditFields, value: string) => void;
  onStartAudit: () => void;
  isStarted: boolean;
  onClose?: () => void;
}

const EXPERIENCE_STORES = [
  'Vicente López',
  'Cañitas',
  'Villa Crespo'
];

export const GeneralFields: React.FC<GeneralFieldsProps> = ({
  fields,
  onFieldChange,
  onStartAudit,
  isStarted,
  onClose
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const storeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.field-item, .start-audit-banner'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out', clearProps: 'transform' }
      );
    }
  }, [isStarted]);

  // Click outside listener for store dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(e.target as Node)) {
        setIsStoreOpen(false);
      }
    };
    if (isStoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStoreOpen]);

  // Animate store menu with GSAP
  useEffect(() => {
    if (isStoreOpen && storeMenuRef.current) {
      gsap.fromTo(
        storeMenuRef.current,
        { opacity: 0, y: -6, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [isStoreOpen]);

  return (
    <section ref={containerRef} className="general-card-setup card" aria-label="Nivel 0: Datos de la Sucursal">
      <div className="setup-header-row">
        <div className="setup-title-group">
          <div className="setup-title-heading-row">
            <h2 className="setup-main-title">Sucursal</h2>
            <span className="setup-step-pill">Nivel 0</span>
          </div>
          <p className="setup-sub-text">Cargá los datos de la sucursal y del auditor para iniciar la auditoría.</p>
        </div>
        {onClose && (
          <button
            type="button"
            className="icon-btn-subtle"
            onClick={onClose}
            title="Cerrar y volver a la auditoría"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="fields-single-line">
        {/* 1. Tienda (Desplegable Estilizado Exclusivo Experience) */}
        <div className={`field-item field-item-store ${isStoreOpen ? 'is-active' : ''}`}>
          <label htmlFor="f_tienda_trigger">
            <Store size={14} className="field-icon" />
            <span>Sucursal Experience <span className="req-star">*</span></span>
          </label>

          <div className="custom-select-container" ref={storeDropdownRef}>
            <button
              id="f_tienda_trigger"
              type="button"
              className={`custom-select-trigger ${isStoreOpen ? 'is-open' : ''}`}
              onClick={() => setIsStoreOpen(prev => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isStoreOpen}
            >
              <span className={`custom-select-text ${!fields.f_tienda ? 'is-placeholder' : ''}`}>
                {fields.f_tienda || (
                  <>
                    <span className="placeholder-desktop">Seleccioná la sucursal...</span>
                    <span className="placeholder-mobile">Seleccionar...</span>
                  </>
                )}
              </span>
              <ChevronDown size={15} className={`custom-select-chevron ${isStoreOpen ? 'rotated' : ''}`} />
            </button>

            {/* Input oculto para preservar id f_tienda en caso de llamadas directas */}
            <input type="hidden" id="f_tienda" value={fields.f_tienda} />

            {isStoreOpen && (
              <div className="custom-select-menu" ref={storeMenuRef} role="listbox">
                {EXPERIENCE_STORES.map((store) => {
                  const isSelected = fields.f_tienda === store;
                  return (
                    <button
                      key={store}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`custom-select-option ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        onFieldChange('f_tienda', store);
                        setIsStoreOpen(false);
                      }}
                    >
                      <span>{store}</span>
                      {isSelected && <Check size={15} className="custom-select-check" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Auditor (Obligatorio) */}
        <div className="field-item">
          <label htmlFor="f_auditor">
            <User size={14} className="field-icon" />
            <span>Auditor/a <span className="req-star">*</span></span>
          </label>
          <input
            id="f_auditor"
            type="text"
            autoComplete="name"
            value={fields.f_auditor}
            onChange={e => onFieldChange('f_auditor', e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        {/* 3. Fecha con Custom DatePicker */}
        <div className="field-item field-item-datepicker">
          <label>
            <span>Fecha de auditoría <span className="req-star">*</span></span>
          </label>
          <CustomDatePicker
            value={fields.f_fecha}
            onChange={val => onFieldChange('f_fecha', val)}
          />
        </div>

        {/* 4. Personal a cargo */}
        <div className="field-item">
          <label htmlFor="f_cargo">
            <Briefcase size={14} className="field-icon" />
            <span>Persona a cargo</span>
          </label>
          <input
            id="f_cargo"
            type="text"
            autoComplete="off"
            value={fields.f_cargo}
            onChange={e => onFieldChange('f_cargo', e.target.value)}
            placeholder="Encargado/a de turno"
          />
        </div>

        {/* 5. Colaboradores */}
        <div className="field-item">
          <label htmlFor="f_colab">
            <Users size={14} className="field-icon" />
            <span>Cant. Colaboradores</span>
          </label>
          <input
            id="f_colab"
            type="number"
            inputMode="numeric"
            min="0"
            value={fields.f_colab}
            onChange={e => onFieldChange('f_colab', e.target.value)}
            placeholder="Ej. 4"
            className="no-spinners"
          />
        </div>

        {/* 6. Unidades vendidas */}
        <div className="field-item">
          <label htmlFor="f_unid">
            <ShoppingBag size={14} className="field-icon" />
            <span>Unidades vendidas</span>
          </label>
          <input
            id="f_unid"
            type="number"
            inputMode="numeric"
            min="0"
            value={fields.f_unid}
            onChange={e => onFieldChange('f_unid', e.target.value)}
            placeholder="Ej. 350"
            className="no-spinners"
          />
        </div>
      </div>

      <div className="setup-actions-footer">
        <button
          type="button"
          className="btn-start-audit-primary"
          onClick={onStartAudit}
        >
          <span>{isStarted ? 'Continuar Auditoría' : 'Iniciar Auditoría'}</span>
          <Play size={18} fill="currentColor" />
        </button>
      </div>
    </section>
  );
};
