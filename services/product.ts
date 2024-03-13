import { DataLayerService } from './general-services/data-layer';
import {
  IPopulate,
  IProduct,
  IUserWithId,
} from '../interfaces_enums/interfaces';
import Product from '../models/Product';
import { populateProducts } from './populate/polulate';
import Order from '../models/Order';

export class ProductService extends DataLayerService<IProduct> {
  private select: string;
  private searchFields: string[];
  private populateOpt: IPopulate[];

  constructor() {
    super(Product);
    this.select = '-createdAt';
    this.searchFields = ['name', 'description'];
    this.populateOpt = populateProducts;
  }

  public async getProducts(searchString: string) {
    return await this.getMany(
      searchString,
      this.select,
      this.searchFields,
      this.populateOpt
    );
  }

  public async getSingleProduct(productId: string) {
    return await this.getOne(productId, this.select, this.populateOpt);
  }

  public async deleteProduct(productId: string) {
    const deletedProduct = await this.delete(productId);

    const { orders, _id } = deletedProduct;
    if (orders.length) {
      for (const ord of orders) {
        const order = await Order.findOne({ _id: ord });
        order?.products.filter(
          (productId) => productId.toString() !== _id.toString()
        );
        await order?.save();
      }
    }

    return deletedProduct;
  }

  public async updateProduct(payload: IProduct, productId: string) {
    await super.validateData(payload);
    const updateProduct = await this.update(
      productId,
      payload,
      this.select,
      this.populateOpt
    );
    return updateProduct;
  }

  public async createProduct(payload: IProduct, creator: IUserWithId) {
    await super.validateData(payload);
    const product = await super.create({
      ...payload,
      createdBy: creator.userId,
    });

    const { _id } = product;
    return await this.getOne(_id, this.select, this.populateOpt);
  }
}
