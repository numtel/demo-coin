
export default function Flag({ value, href }) {
  const shape = Number(value & 0xFFn);
  const color1 = ((value >> 8n) & 0xFFFFFFn).toString(16).padStart(6, '0');
  const color2 = ((value >> 32n) & 0xFFFFFFn).toString(16).padStart(6, '0');
  const color3 = ((value >> 56n) & 0xFFFFFFn).toString(16).padStart(6, '0');
  let background;

  if(shape === 0) {
    background = `linear-gradient(90deg,
      #${color1} 33.2%,
      #${color2} 33.3%, #${color2} 66.6%,
      #${color3} 66.7%)`;
  } else if(shape === 1) {
    background = `linear-gradient(0deg,
      #${color1} 33.2%,
      #${color2} 33.3%, #${color2} 66.6%,
      #${color3} 66.7%)`;
  } else if(shape === 2) {
    background = `linear-gradient(-30deg,
      #${color1} 32.0%,
      #${color2} 33.3%, #${color2} 65.6%,
      #${color3} 66.9%)`;
  } else if(shape === 3) {
    background = `radial-gradient(
      #${color1} 31.0%,
      #${color2} 33.3%, #${color2} 65.6%,
      #${color3} 67.9%)`;
  } else if(shape === 4) {
    background = `conic-gradient(
      #${color1} 1%, #${color1} 32.5%,
      #${color2} 33.3%, #${color2} 66.3%,
      #${color3} 67.9%, #${color3} 99%)`;
  } else {
    background = `black`;
  }

  if(href) return (<a href={href} rel="noopener" target="_blank"><div
    className="flag"
    style={{
      background
    }}
  /></a>);
  return (<div
    className="flag"
    style={{
      background
    }}
  />);
}
