export const getActiveMenu = (metaActiveMenu: any) => {
  return typeof metaActiveMenu === 'string' || typeof metaActiveMenu === 'number'
    ? metaActiveMenu
    : null;
};