import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { format } from 'date-fns';
import { config } from '@root/config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('health');
export class Get {
  public async health(req: Request, res: Response): Promise<void> {
    res
      .status(HTTP_STATUS.OK)
      .json({ message: `Health: Server instance is healthy with process id ${process.pid} on ${format(new Date(), 'MM/dd/yyyy')}` });
  }
  public async env(req: Request, res: Response): Promise<void> {
    res.status(HTTP_STATUS.OK).send(`This is the ${config.NODE_ENV} environment.`);
  }
  public async instance(req: Request, res: Response): Promise<void> {
    try {
      const fetchResponse = await fetch(`${config.EC2_URL}`);
      if (!fetchResponse.ok) {
        throw new Error(`Error: ${fetchResponse.status} - ${fetchResponse.statusText}`);
      }

      const responseData = await fetchResponse.json();
      res
        .status(HTTP_STATUS.OK)
        .send(
          `Server is running on EC2 instance with id ${responseData} and process id ${process.pid} on ${format(new Date(), 'MM/dd/yyyy')}`
        );
    } catch (error) {
      log.error(`Error fetching data: ${error}`);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error fetching data from EC2 instance');
    }
  }
  public async fibonacci(req: Request, res: Response): Promise<void> {
    try {
      const { num } = req.params;
      const start: number = performance.now();
      const result: number = Get.prototype.fibo(parseInt(num, 10));
      const end: number = performance.now();
      const fetchResponse = await fetch(`${config.EC2_URL}`);
      if (!fetchResponse.ok) {
        throw new Error(`Error: ${fetchResponse.status} - ${fetchResponse.statusText}`);
      }
      const responseData = await fetchResponse.json();
      res
        .status(HTTP_STATUS.OK)
        .send(
          `Fibonacci series of ${num} is ${result} and it took ${end - start} ms and runs with process id ${
            process.pid
          } on ${responseData} at ${format(new Date(), 'MM/dd/yyyy')}`
        );
    } catch (err) {
      log.error(err);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error fetching data from EC2 instance');
    }
  }
  private fibo(data: number): number {
    if (data < 2) {
      return 1;
    } else {
      return this.fibo(data - 2) + this.fibo(data - 1);
    }
  }
}
