export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {

};

export enum ScreenState {
  CATALOG = 'catalog',
  ITEM_OPENED = 'item',
  BASKET_OPENED = 'basket',
  ORDER_PPROCEEDING = 'order_proceeding',
  CUSTOMER_DATA_REQUEST = 'customer_data_request',
  ORDER_SUCCESS = 'order_success'
}