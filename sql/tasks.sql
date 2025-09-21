create table public.task (
  task_id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  content text null,
  is_complete boolean null default false,
  updated_at timestamp with time zone null,
  deadline timestamp with time zone null,
  assigned_by uuid not null,
  assigned_to uuid not null,
  title text not null,
  constraint task_pkey primary key (task_id),
  constraint task_assigned_by_fkey foreign KEY (assigned_by) references "userData" (user_id),
  constraint task_assigned_to_fkey foreign KEY (assigned_to) references "userData" (user_id)
) TABLESPACE pg_default;