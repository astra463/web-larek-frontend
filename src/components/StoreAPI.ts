import {
	IOrder,
	IProduct,
	PlaceOrderRequest,
	PlaceOrderResponse,
} from '../types';
import { Api } from './base/api';

export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};

export interface IStoreAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	placeOrder: (
		orderData: Partial<PlaceOrderRequest>
	) => Promise<PlaceOrderResponse>;
}

export class StoreAPI extends Api implements IStoreAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	getProductItem(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then((item: IProduct) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	placeOrder(requestBody: PlaceOrderRequest): Promise<PlaceOrderResponse> {
		return this.post('/order', requestBody).then(
			(order: PlaceOrderResponse) => order
		);
	}
}
