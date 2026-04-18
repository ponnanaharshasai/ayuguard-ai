import React from 'react';

const PillIcon = ({ shape, color, size = 32 }) => {
  const styles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    borderRadius: shape === 'circle' ? '50%' : shape === 'oval' ? '40% 60%' : '10px 10px 0 0',
    backgroundColor: color,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    color: '#fff',
    fontSize: size * 0.4,
    fontWeight: 'bold',
  };

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return <div style={styles} />;
      case 'oval':
        return <div style={{ ...styles, width: size * 1.4, height: size * 0.8 }} />;
      case 'capsule':
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...styles, height: size / 2, borderRadius: '50% 50% 0 0', backgroundColor: color }} />
            <div style={{ ...styles, height: size / 2, borderRadius: '0 0 50% 50%', backgroundColor: '#f0f0f0', border: `1px solid ${color}` }} />
          </div>
        );
      default:
        return <div style={styles} />;
    }
  };

  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{renderShape()}</div>;
};

export default PillIcon;
