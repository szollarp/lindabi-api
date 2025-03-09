import { User } from "../models/interfaces/user";
import { EXECUTION_SETTLEMENT, FINANCIAL_SETTING_TYPE } from "../constants";
import { Execution } from "../models/interfaces/execution";
import { Salary } from "../models/interfaces/salary";
import { FinancialSetting } from "../models/interfaces/financial-setting";

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

const getDailyAmount = (salaries: Salary[], execution: Execution): number => {
  const salary = getSalaryForDate(salaries, execution.dueDate!);
  if (!salary) return 0;

  return salary.dailyRate || 0;
};

const getItemizedAmount = (execution: Execution): number => {
  const { quantity, projectItem } = execution;
  const qNetAmount = Number(projectItem!.netAmount) / Number(projectItem!.quantity);
  return Number(quantity) * qNetAmount;
};

const getDistanceAmount = (execution: Execution, settings: FinancialSetting[]): number => {
  const kmRate = settings.find(setting => setting.type === FINANCIAL_SETTING_TYPE.KM_RATE)?.amount || 0;

  const { distance } = execution;
  return (Number(distance) ?? 0) * kmRate;
};

export const getEmployeePayroll = (employee: User, settings: FinancialSetting[]) => {
  const { executions, invoices, salaries, id, name, contact } = employee;

  const itemizedExecutions = executions?.filter(execution => execution.settlement === EXECUTION_SETTLEMENT.ITEMIZED);
  const itemizedAmount = itemizedExecutions?.reduce((acc, execution) => acc + getItemizedAmount(execution), 0) || 0;

  const hourlyExecutions = executions?.filter(execution => execution.settlement === EXECUTION_SETTLEMENT.HOURLY);
  let totalHours = hourlyExecutions?.reduce((acc, execution) => acc + calculateWorkHours(execution), 0) || 0;
  let hourlyAmount = hourlyExecutions?.reduce((acc, execution) => acc + getHourlyAmount(salaries!, execution), 0) || 0;

  const dailyExecutions = executions?.filter(execution => execution.settlement === EXECUTION_SETTLEMENT.DAILY);
  totalHours += ((dailyExecutions?.length || 0) * 8) || 0;
  hourlyAmount += dailyExecutions?.reduce((acc, execution) => acc + getDailyAmount(salaries!, execution), 0) || 0;

  const distanceExecutions = executions?.filter(execution => execution.settlement === EXECUTION_SETTLEMENT.DISTANCE);
  const distanceAmount = distanceExecutions?.reduce((acc, execution) => acc + getDistanceAmount(execution, settings), 0) || 0;

  const invoicesAmount = invoices?.reduce((acc, invoice) => acc + invoice.netAmount, 0) || 0;

  const bonusAmount = settings.find(setting => setting.type === FINANCIAL_SETTING_TYPE.SUPERVISOR_BONUS)?.amount || 0;
  const supervisorBonus = (contact?.projectSupervisors?.length || 0) * Number(bonusAmount);

  const summary = itemizedAmount + hourlyAmount + distanceAmount + supervisorBonus - invoicesAmount;

  return {
    id,
    name,
    itemizedAmount,
    invoicesAmount,
    hourlyAmount,
    distanceAmount,
    totalHours,
    supervisorBonus,
    summary
  }
};