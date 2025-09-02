-- Function to update tournament results in a transaction
create or replace function update_tournament_results(
    p_tournament_id uuid,
    p_results jsonb[]
) returns void
language plpgsql
security definer
as $$
declare
    result_record jsonb;
begin
    -- Check if user has permission
    if not exists (
        select 1 from user_roles
        where user_roles.user_id = auth.uid()
        and user_roles.role in ('admin', 'game_host')
    ) then
        raise exception 'Unauthorized';
    end if;

    -- Start transaction
    begin
        -- Delete existing results
        delete from tournament_results
        where tournament_id = p_tournament_id;

        -- Insert new results
        for result_record in select * from jsonb_array_elements(p_results::jsonb)
        loop
            insert into tournament_results (
                tournament_id,
                user_id,
                position,
                prize
            ) values (
                p_tournament_id,
                (result_record->>'user_id')::uuid,
                (result_record->>'position')::integer,
                result_record->>'prize'
            );
        end loop;
    exception when others then
        -- If anything fails, the transaction will be rolled back
        raise exception 'Failed to update tournament results: %', sqlerrm;
    end;
end;
$$;
