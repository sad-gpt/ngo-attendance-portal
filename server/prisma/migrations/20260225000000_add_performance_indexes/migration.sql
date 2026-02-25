-- Performance indexes for attendance system
-- Applied after: 20260224000000_init

CREATE INDEX "attendance_children_date_idx" ON "attendance_children"("date");
CREATE INDEX "attendance_staff_date_idx" ON "attendance_staff"("date");
CREATE INDEX "children_age_name_idx" ON "children"("age", "name");
CREATE INDEX "logbook_returnTime_idx" ON "logbook"("returnTime");
CREATE INDEX "logbook_exitTime_idx" ON "logbook"("exitTime");
CREATE INDEX "volunteers_log_arrivalTime_idx" ON "volunteers_log"("arrivalTime");
CREATE INDEX "children_status_idx" ON "children"("status");
CREATE INDEX "staff_status_idx" ON "staff"("status");
CREATE INDEX "logbook_type_personId_idx" ON "logbook"("type", "personId");
