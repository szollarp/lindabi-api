import { Op, where } from "sequelize";
import { Context } from "../types";
import { User } from "../models/interfaces/user";
import { EXECUTION_SETTLEMENT } from "../constants";
import { Execution } from "../models/interfaces/execution";
import { Salary } from "../models/interfaces/salary";

const getSalaryForDate = (salaries: Salary[], targetDate: Date): Salary | null => {
  for (const salary of salaries) {
    const startDate = new Date(salary.startDate);
    const endDate = salary.endDate ? new Date(salary.endDate) : null;

    if (
      targetDate >= startDate &&
      (endDate === null || targetDate <= endDate)
    ) {
      return salary;
    }
  }

  return null;
}

const calculateWorkHours = (execution: Execution): number => {
  const { workdayStart, workdayEnd, breakStart, breakEnd } = execution;

  const toDate = (time: string): Date => {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes);
  };

  const workdayStartTime = toDate(workdayStart!);
  const workdayEndTime = toDate(workdayEnd!);
  const breakStartTime = toDate(breakStart!);
  const breakEndTime = toDate(breakEnd!);

  const workdayDuration = workdayEndTime.getTime() - workdayStartTime.getTime();
  const breakDuration = breakEndTime.getTime() - breakStartTime.getTime();

  const actualWorkDuration = workdayDuration - breakDuration;
  return actualWorkDuration / (1000 * 60 * 60);
};

const getHourlyAmount = (salaries: Salary[], execution: Execution): number => {
  const workHours = calculateWorkHours(execution);

  const salary = getSalaryForDate(salaries, execution.dueDate!);
  if (!salary) return 0;

  return workHours * (salary.hourlyRate || 0);
};

const getItemizedAmount = (execution: Execution): number => {
  const { quantity, projectItem } = execution;
  return Number(quantity) * Number(projectItem!.netAmount);
};

const getDistanceAmount = (execution: Execution): number => {
  const { distance } = execution;
  return Number(distance) ?? 0;
};

export const getEmployeePayroll = (employee: User) => {
  const { executions, invoices, salaries, id, name } = employee;

  const itemizedExecutions = executions?.filter(execution => execution.settlement === EXECUTION_SETTLEMENT.ITEMIZED);
  const itemizedAmount = itemizedExecutions?.reduce((acc, execution) => acc + getItemizedAmount(execution), 0) || 0;

  const hourlyExecutions = executions?.filter(execution => execution.settlement === EXECUTION_SETTLEMENT.HOURLY);
  const totalHours = hourlyExecutions?.reduce((acc, execution) => acc + calculateWorkHours(execution), 0) || 0;
  const hourlyAmount = hourlyExecutions?.reduce((acc, execution) => acc + getHourlyAmount(salaries!, execution), 0) || 0;

  const distanceExecutions = executions?.filter(execution => execution.settlement === EXECUTION_SETTLEMENT.DISTANCE);
  const distanceAmount = distanceExecutions?.reduce((acc, execution) => acc + getDistanceAmount(execution), 0) || 0;

  const invoicesAmount = invoices?.reduce((acc, invoice) => acc + invoice.netAmount, 0) || 0;

  return {
    id,
    name,
    itemizedAmount,
    invoicesAmount,
    hourlyAmount,
    distanceAmount,
    totalHours
  }
};