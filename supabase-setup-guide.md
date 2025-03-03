# Supabase Setup Guide for FPL Analytics

Follow these steps to set up your Supabase database for the FPL Analytics application.

## 1. Create Required Tables

### Players Table
1. Go to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to the "Table Editor" in the left sidebar
4. Click "Create a new table"
5. Set the table name to `players`
6. Add the following columns:
   - `id` (type: int8, primary key)
   - `data` (type: jsonb)
   - `last_updated` (type: timestamptz, default: now())
7. Click "Save"

### Player Summaries Table
1. Click "Create a new table" again
2. Set the table name to `player_summaries`
3. Add the following columns:
   - `player_id` (type: int8, primary key)
   - `summary_data` (type: jsonb)
   - `last_updated` (type: timestamptz, default: now())
4. Click "Save"

### All Players Table
1. Click "Create a new table" again
2. Set the table name to `all_players`
3. Add the following columns:
   - `id` (type: int8, primary key)
   - `players_data` (type: jsonb)
   - `last_updated` (type: timestamptz, default: now())
4. Click "Save"

## 2. Configure Row Level Security (RLS)

For each table, you need to enable RLS and create policies to allow operations:

### For the Players Table
1. Go to the "Authentication" section in the left sidebar
2. Click on "Policies"
3. Find the `players` table and click "Edit"
4. Enable RLS by toggling the switch
5. Click "Add Policy"
6. Select "Create a policy from scratch"
7. Set the policy name to "Allow all operations for all users"
8. For "Target roles", select both "authenticated" and "anon"
9. For "Policy definition", select "Apply policy to all operations"
10. For "Using expression", enter `true`
11. For "With check expression", enter `true`
12. Click "Save Policy"

### Repeat for Player Summaries Table
Follow the same steps as above but for the `player_summaries` table.

### Repeat for All Players Table
Follow the same steps as above but for the `all_players` table.

## 3. Verify Setup

After completing the above steps, run the verification script to ensure everything is set up correctly:

```bash
node verify-tables.js
```

You should see all tables accessible and the test insert should succeed.

## Troubleshooting

If you encounter issues:

1. **Table doesn't exist**: Make sure you've created all three tables with the correct names and column types.
2. **RLS policy error**: Ensure RLS is enabled and policies are created for all tables.
3. **Permission denied**: Check that both authenticated and anon roles have the necessary permissions.

For more help, refer to the [Supabase documentation](https://supabase.com/docs). 