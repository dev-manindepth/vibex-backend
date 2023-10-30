import { Get } from '@health/controllers/health';
import express, { Router } from 'express';

class HealthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.get('/health', Get.prototype.health);
    this.router.get('/instance', Get.prototype.instance);
    this.router.get('/env', Get.prototype.env);
    this.router.get('/fibo/:num', Get.prototype.fibonacci);
    return this.router;
  }
}
export const healthRoutes: HealthRoutes = new HealthRoutes();
