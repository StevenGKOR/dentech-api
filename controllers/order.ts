import { Request, Response } from 'express';
import { OrderService } from '../services/orders';
import { StatusCodes } from 'http-status-codes';
import { IUserWithId } from '../interfaces_enums/interfaces';

export class OrderController {
  private serv: OrderService;

  constructor() {
    this.serv = new OrderService();
  }

  public async updateOrder(req: Request, res: Response) {
    const { body } = req;
    const { id } = req.params;

    const order = await this.serv.updateOrder(body, id);

    res.status(StatusCodes.OK).json({
      order,
      message: 'Η παραγγέλια ενημερώθηκε!',
    });
  }

  public async createOrder(req: Request, res: Response) {
    const { body } = req;
    const { currentUser } = req;

    const order = await this.serv.createOrder(body, currentUser as IUserWithId);

    res
      .status(StatusCodes.OK)
      .json({ order, message: 'Το παραγγέλια δημιουργήθηκε!' });
  }

  public async deleteOrder(req: Request, res: Response) {
    const { id } = req.params;
    const order = await this.serv.deleteOrder(id);
    res
      .status(StatusCodes.OK)
      .json({ order, message: 'To παραγγέλια διαγραφτήκε!' });
  }

  public async getOrders(req: Request, res: Response) {
    const orders = await this.serv.getOrders();
    res.status(StatusCodes.OK).json({ orders, totalCount: orders.length });
  }

  public async getSingleOrder(req: Request, res: Response) {
    const { id } = req.params;
    const order = await this.serv.getSingleOrder(id);
    res.status(StatusCodes.OK).json({ order });
  }

  public async getOrderByDentistId(req: Request, res: Response) {
    const { dentist } = req.query;
    const orders = await this.serv.getOrderByDentistId(dentist as string);
    res.status(StatusCodes.OK).json({ orders, totalCount: orders.length });
  }

  public async getMyOrders(req: Request, res: Response) {
    const { userId } = req.currentUser as IUserWithId;
    const orders = await this.serv.getOrderByDentistId(userId.toString());
    res.status(StatusCodes.OK).json({ orders, totalCount: orders.length });
  }
}
