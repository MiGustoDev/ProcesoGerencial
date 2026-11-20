import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AuditFields } from '../types/audit';
import { Store, User, Users, ShoppingBag, Briefcase, Play, X } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

interface GeneralFieldsProps {
  fields: AuditFields;
  onFieldChange: (field: keyof AuditFields, value: string) => void;
  onStartAudit: () => void;
  isStarted: boolean;
  onClose?: () => void;
}

export const GeneralFields: React.FC<GeneralFieldsProps> = ({
  fields,
  onFieldChange,
  onStartAudit,
  isStarted,
  onClose
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.field-item, .start-audit-banner'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [isStarted]);

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
        {/* 1. Tienda (Obligatorio - Exclusivo Experience) */}
        <div className="field-item">
          <label htmlFor="f_tienda">
            <Store size={14} className="field-icon" />
            <span>Sucursal Experience <span className="req-star">*</span></span>
          </label>
          <input
            id="f_tienda"
            type="text"
            list="experience-stores-list"
            autoComplete="off"
            value={fields.f_tienda}
            onChange={e => onFieldChange('f_tienda', e.target.value)}
            placeholder="Seleccioná o escribí la sucursal"
          />
          <datalist id="experience-stores-list">
            <option value="Vicente López" />
            <option value="Cañitas" />
            <option value="Villa Crespo" />
          </datalist>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            {['Vicente López', 'Cañitas', 'Villa Crespo'].map((store) => (
              <button
                key={store}
                type="button"
                onClick={() => onFieldChange('f_tienda', store)}
                style={{
                  fontSize: '11px',
                  fontWeight: fields.f_tienda === store ? '700' : '500',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: fields.f_tienda === store ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
                  background: fields.f_tienda === store ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                  color: fields.f_tienda === store ? '#38bdf8' : '#cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {store}
              </button>
            ))}
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
        <div className="field-item">
          <label>
            <span>Fecha de auditoría</span>
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
