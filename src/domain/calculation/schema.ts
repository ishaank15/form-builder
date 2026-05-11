import { z } from "zod";
import type { AggregatorId } from "./types";

export const aggregatorIdSchema = z.enum([
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "MUL",
]) satisfies z.ZodType<AggregatorId>;
