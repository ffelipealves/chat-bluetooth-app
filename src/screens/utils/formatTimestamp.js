export const formatTimestamp = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${now.toLocaleDateString()} ${hours}:${minutes}`;
  };
  