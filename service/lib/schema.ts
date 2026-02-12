import { z } from 'zod';

export const vehicleSchema = z.object({
  id: z.number(),
  plateNumber: z.string().min(1, "Госномер не может быть пустым"),
  model: z.string().min(1, "Модель обязательна"),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  status: z.enum(['in_service', 'in_repair', 'out_of_order']),
});

export const employeeSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Имя не может быть пустым"),
  specialization: z.string().min(1, "Специализация обязательна"),
});

export const vehiclesSchema = z.array(vehicleSchema);
export const employeesSchema = z.array(employeeSchema);

export type Vehicle = z.infer<typeof vehicleSchema>;
export type Employee = z.infer<typeof employeeSchema>;
