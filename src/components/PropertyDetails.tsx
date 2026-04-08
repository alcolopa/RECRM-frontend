import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Building2,
  Tag,
  Share2,
  Edit2,
  Trash2,
  ChevronRight,
  Info,
  X,
  User,
  Mail,
  Phone,
  Copy,
  HandCoins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Property } from '../api/properties';
import Button from './Button';
import { useUnits } from '../contexts/UnitContext';
import { useNavigation } from '../contexts/NavigationContext';
import { getImageUrl } from '../utils/url';
import { usePermissions } from '../utils/permissions';
import { type UserProfile, Permission } from '../api/users';
import MatchedClients from './MatchedClients';

import { formatCurrency } from '../utils/currency';

interface PropertyDetailsProps {
  property: Property;
  user?: UserProfile;
  onBack: () => void;
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
  isPublic?: boolean;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ 
  property, 
  user,
  onBack, 
  onEdit, 
  onDelete,
  isPublic = false 
}) => {
  const { formatAreaDisplay } = useUnits();
  const { navigate } = useNavigation();
  const permissions = usePermissions(user || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for price';
    return formatCurrency(price, 'USD', { maximumFractionDigits: 0 });
  };

  const nextImage = () => {
    if (property.propertyImages?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % property.propertyImages.length);
    }
  };

  const prevImage = () => {
    if (property.propertyImages?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + property.propertyImages.length) % property.propertyImages.length);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${property.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [property.propertyImages]);

  useEffect(() => {
    // Logic for mobile nav or other global interactions could go here
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={containerStyle}
    >
      {/* Top Header - Organizations Logo/Branding for Public view */}
      {isPublic && (
        <div style={publicHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '2.5rem', 
              height: '2.5rem', 
              background: property.organization?.logo ? `url(${getImageUrl(property.organization.logo)})` : 'rgba(var(--color-primary-rgb), 0.1)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              border: property.organization?.logo ? '1px solid var(--color-border)' : 'none'
            }}>
              {!property.organization?.logo && <Building2 size={24} />}
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-text)' }}>
              {property.organization?.name || 'EstateHub'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button 
              variant="ghost" 
              onClick={handleShare}
              aria-label="Share property"
              style={{ borderRadius: '50%', width: '40px', height: '40px' }}
            >
              <Share2 size={20} />
            </Button>
          </div>
        </div>
      )}

      {/* Internal Header - Sticky on Mobile */}
      {!isPublic && (
        <div style={headerStyle}>
          <Button
            variant="ghost"
            onClick={onBack}
            aria-label="Back to properties"
            style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', background: 'var(--color-surface)' }}
          >
            <ChevronLeft size={24} />
          </Button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="ghost"
                onClick={handleShare}
                aria-label="Share property"
                style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', background: 'var(--color-surface)' }}
                title="Share property"
              >
                <Share2 size={20} />
              </Button>
          </div>
        </div>
      )}

      {/* Global Toast Popup */}
      <AnimatePresence>
        {showShareTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: '2.5rem',
              left: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '0.75rem 1.25rem',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              zIndex: 10000,
              pointerEvents: 'none',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Copy size={18} />
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Image Section / Carousel */}
      <div style={heroSectionStyle}>
        {property.propertyImages?.length > 0 ? (
          <div style={carouselStyle}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={currentImageIndex}
                src={getImageUrl(property.propertyImages[currentImageIndex].url)}
                alt={property.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={heroImageStyle}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) prevImage();
                  else if (info.offset.x < -50) nextImage();
                }}
                onClick={() => setIsLightboxOpen(true)}
              />
            </AnimatePresence>

            {property.propertyImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  aria-label="Previous image"
                  style={{ ...navButtonStyle, left: '1rem' }}
                  className="hidden-mobile"
                >
                  <ChevronLeft size={24} color="#fff" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  aria-label="Next image"
                  style={{ ...navButtonStyle, right: '1rem' }}
                  className="hidden-mobile"
                >
                  <ChevronRight size={24} color="#fff" />
                </button>
                <div style={imageCounterStyle}>
                  {currentImageIndex + 1} / {property.propertyImages.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={placeholderHeroStyle}>
            <Building2 size={64} color="var(--color-border)" />
          </div>
        )}
      </div>

      {/* Thumbnail Strip (Desktop Optimized) */}
      {property.propertyImages?.length > 1 && (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="gallery-thumbnail-strip">
            {property.propertyImages.map((img, idx) => (
              <div
                key={img.id}
                className={`gallery-thumbnail-item ${idx === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                <img src={getImageUrl(img.url)} alt={`Thumbnail ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div style={contentStyle}>
        <div style={mainInfoStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h1 style={titleStyle}>{property.title}</h1>
            <span style={priceStyle}>{formatPrice(property.price)}</span>
          </div>
          <div style={locationStyle}>
            <MapPin size={18} />
            <span>{[property.address, property.city, property.governorate, property.country].filter(Boolean).join(', ')} {property.zipCode}</span>
          </div>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-2 grid-4" style={{
          padding: '1.25rem',
          background: 'var(--color-surface)',
          borderRadius: '1rem',
          marginBottom: '2rem',
          border: '1px solid var(--color-border)',
          gap: '1rem'
        }}>
          <div style={specItemStyle}>
            <Bed size={20} />
            <div style={specLabelStyle}>Bedrooms</div>
            <div style={specValueStyle}>{property.bedrooms || 0}</div>
          </div>
          <div style={specItemStyle}>
            <Bath size={20} />
            <div style={specLabelStyle}>Bathrooms</div>
            <div style={specValueStyle}>{property.bathrooms || 0}</div>
          </div>
          <div style={specItemStyle}>
            <Maximize size={20} />
            <div style={specLabelStyle}>Size</div>
            <div style={specValueStyle}>{formatAreaDisplay(property.area || 0)}</div>
          </div>
          <div style={specItemStyle}>
            <Calendar size={20} />
            <div style={specLabelStyle}>Built</div>
            <div style={specValueStyle}>{property.yearBuilt || 'N/A'}</div>
          </div>
        </div>

        {/* Description */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}><Info size={20} /> Description</h2>
          <p style={descriptionTextStyle}>
            {property.description || 'No description provided for this property.'}
          </p>
        </div>

        {/* Features */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}><Tag size={19} /> Features & Amenities</h2>
          <div style={featuresGridStyle}>
            {property.features && property.features.length > 0 ? (
              property.features.map((feature: string, idx: number) => (
                <div key={idx} style={featureTagStyle}>
                  {feature}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No features listed.</p>
            )}
          </div>
        </div>

        {/* Seller Info */}
        {!isPublic && (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}><User size={20} /> Property Owner</h2>
            {property.sellerProfile?.contact ? (
              <div className="card" style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                marginTop: '0.5rem',
                minWidth: 0
              }}>
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'rgba(var(--color-primary-rgb), 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)',
                  flexShrink: 0
                }}>
                  <User size={28} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {property.sellerProfile.contact.firstName} {property.sellerProfile.contact.lastName}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '100%' }}>
                      <Mail size={16} style={{ flexShrink: 0 }} /> 
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {property.sellerProfile.contact.email || 'No email provided'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '100%' }}>
                      <Phone size={16} style={{ flexShrink: 0 }} /> 
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {property.sellerProfile.contact.phone || 'No phone provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem'
              }}>
                No owner information assigned to this property.
              </div>
            )}
          </div>
        )}

        {/* Listing Agent Info */}
        {!isPublic && (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}><User size={20} /> Listing Agent</h2>
            {property.assignedUser ? (
              <div className="card" style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                marginTop: '0.5rem',
                minWidth: 0
              }}>
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'rgba(var(--color-primary-rgb), 0.1)',
                  backgroundImage: property.assignedUser.avatar ? `url(${getImageUrl(property.assignedUser.avatar)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)',
                  flexShrink: 0
                }}>
                  {!property.assignedUser.avatar && <User size={28} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {property.assignedUser.firstName} {property.assignedUser.lastName}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '100%' }}>
                      <Mail size={16} style={{ flexShrink: 0 }} /> 
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {property.assignedUser.email}
                      </span>
                    </div>
                    {property.assignedUser.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '100%' }}>
                        <Phone size={16} style={{ flexShrink: 0 }} /> 
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {property.assignedUser.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem'
              }}>
                No realtor assigned to this property.
              </div>
            )}
          </div>
        )}

        {/* Offers & Negotiations (Internal only) */}
        {!isPublic && (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}><HandCoins size={20} /> Active Offers</h2>
            {(property as any).negotiations && (property as any).negotiations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {(property as any).negotiations.map((neg: any) => {
                  const latestOffer = neg.offers?.[0];
                  if (!latestOffer) return null;
                  return (
                    <div 
                      key={neg.id} 
                      className="card" 
                      onClick={() => navigate('offers')}
                      style={{ 
                        padding: '1rem', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '0.75rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(var(--color-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                          <User size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                            {formatCurrency(Number(latestOffer.price), 'USD', { maximumFractionDigits: 0 })}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {neg.contact?.firstName} {neg.contact?.lastName} • {latestOffer.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} color="var(--color-text-muted)" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                No active offers for this property yet.
              </div>
            )}
          </div>
        )}

        {/* AI Matching Clients (Internal only) */}
        {!isPublic && (
          <MatchedClients organizationId={property.organizationId} propertyId={property.id} />
        )}

        {/* Action Buttons */}
        {!isPublic && (
          <div style={footerActionsStyle}>
            {permissions.can(Permission.DEALS_CREATE) && (
              <Button
                variant="primary"
                onClick={() => navigate('offers', { prefillData: { propertyId: property.id } })}
                style={{ flex: 1.5 }}
                leftIcon={<HandCoins size={18} />}
              >
                Make Offer
              </Button>
            )}
            {onEdit && permissions.can(Permission.PROPERTIES_EDIT) && (
              <Button
                variant="secondary"
                onClick={() => onEdit(property)}
                style={{ flex: 1 }}
                leftIcon={<Edit2 size={18} />}
              >
                Edit
              </Button>
            )}
            {onDelete && permissions.can(Permission.PROPERTIES_DELETE) && (
              <Button
                variant="danger"
                onClick={() => onDelete(property.id)}
                style={{ flex: 1 }}
                leftIcon={<Trash2 size={18} />}
              >
                Delete
              </Button>
            )}
          </div>
        )}

        {/* Public CTA */}
        {isPublic && (
          <>
            {(property.assignedUser?.phone || property.assignedUser?.email) ? (
              <div className="card" style={{ padding: '2rem', border: '2px solid var(--color-primary)', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Interested in this property?</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                    backgroundImage: property.assignedUser?.avatar ? `url(${getImageUrl(property.assignedUser.avatar)})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    {!property.assignedUser?.avatar && `${property.assignedUser?.firstName?.[0] || ''}${property.assignedUser?.lastName?.[0] || ''}`}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>{property.assignedUser?.firstName} {property.assignedUser?.lastName}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Listing Agent</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {property.assignedUser?.phone && (
                    <Button 
                      fullWidth 
                      size="lg"
                      onClick={() => window.open(`https://wa.me/${property.assignedUser?.phone?.replace(/\D/g, '')}`, '_blank')}
                      style={{ backgroundColor: '#25D366', border: 'none' }}
                      leftIcon={<i className="fa-brands fa-whatsapp" style={{ fontSize: '20px' }}></i>}
                    >
                      Contact via WhatsApp
                    </Button>
                  )}
                  {property.assignedUser?.email && (
                    <Button 
                      fullWidth 
                      variant="outline"
                      size="lg"
                      onClick={() => window.location.href = `mailto:${property.assignedUser?.email}`}
                      leftIcon={<Mail size={20} />}
                    >
                      Contact via Email
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox-overlay"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="lightbox-close"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Close lightbox"
              >
                <X size={24} />
              </button>

              <motion.img
                key={currentImageIndex}
                src={getImageUrl(property.propertyImages[currentImageIndex].url)}
                className="lightbox-image"
                alt="Fullscreen view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) prevImage();
                  else if (info.offset.x < -50) nextImage();
                }}
              />

              {property.propertyImages.length > 1 && (
                <>
                  <Button
                    className="lightbox-nav prev"
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={32} color="#fff" />
                  </Button>
                  <Button
                    className="lightbox-nav next"
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={32} color="#fff" />
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  width: '100%',
  minHeight: '100vh',
  position: 'relative',
  paddingBottom: '2rem'
};

const publicHeaderStyle: React.CSSProperties = {
  height: '4.5rem',
  backgroundColor: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 1.5rem',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const headerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  zIndex: 10,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)'
};

const heroSectionStyle: React.CSSProperties = {
  height: '45vh',
  width: '100%',
  background: '#f0f0f0',
  position: 'relative',
  overflow: 'hidden'
};

const carouselStyle: React.CSSProperties = {
  height: '100%',
  width: '100%',
  position: 'relative'
};

const heroImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

// Dropdown Styles
const placeholderHeroStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-bg-soft)'
};

const navButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  width: '44px',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10,
  color: '#fff',
  backdropFilter: 'blur(4px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease'
};

const imageCounterStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '1rem',
  right: '1rem',
  background: 'rgba(0,0,0,0.6)',
  color: 'white',
  padding: '0.25rem 0.75rem',
  borderRadius: '1rem',
  fontSize: '0.75rem',
  fontWeight: 600
};

const contentStyle: React.CSSProperties = {
  padding: '1.5rem',
  marginTop: '1rem',
  background: 'var(--color-bg)',
  borderRadius: '2rem 2rem 0 0',
  position: 'relative',
  zIndex: 10,
  maxWidth: '800px',
  margin: '1rem auto 0 auto',
  boxShadow: '0 -10px 30px rgba(0,0,0,0.05)'
};

const mainInfoStyle: React.CSSProperties = {
  marginBottom: '2rem'
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 800,
  margin: 0,
  flex: 1
};

const priceStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: 'var(--color-primary)',
  whiteSpace: 'nowrap'
};

const locationStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'var(--color-text-muted)',
  fontSize: '0.875rem',
  marginTop: '0.5rem'
};

const specItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem',
  color: 'var(--color-primary)'
};

const specLabelStyle: React.CSSProperties = {
  fontSize: '0.625rem',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: 'var(--color-text-muted)'
};

const specValueStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'var(--color-text)'
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '2rem'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 700,
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'var(--color-text)'
};

const descriptionTextStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  lineHeight: '1.6',
  fontSize: '0.9375rem'
};

const featuresGridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem'
};

const featureTagStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: 'var(--color-surface)',
  borderRadius: '2rem',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--color-primary)',
  border: '1px solid rgba(var(--color-primary-rgb), 0.1)'
};

const footerActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginTop: '3rem',
  position: 'sticky',
  bottom: '1rem'
};

export default PropertyDetails;
