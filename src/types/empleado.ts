export type EmpleadoRole = 
  | 'admin' 
  | 'gerente' 
  | 'sala' 
  | 'cocina' 
  | 'cajero' 
  | 'sommelier' 
  | 'staff';

export type TurnoStatus = 'activo' | 'descanso' | 'inactivo';

export interface Empleado {
  id: string;
  nombre: string;
  documentoIdentidad: string;
  cargo: string;
  rol: EmpleadoRole;
  email: string;
  telefono?: string;
  pinAcceso?: string;
  estadoTurno: TurnoStatus;
  salarioBase?: number;
  restauranteId?: string;
  fechaIngreso?: string;
  creadoEn?: string;
}
