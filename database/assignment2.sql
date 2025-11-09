-- 1) Insert Tony Stark (PK and account_type handled by defaults)
INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )
VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
  );
-- 2) Make Tony an Admin (casts to your enum if you used one)
UPDATE public.account
SET account_type = 'Admin'::account_type
WHERE account_id = (
    SELECT account_id
    FROM public.account
    WHERE account_email = 'tony@starkent.com'
  );
-- 3) Delete Tony Stark
DELETE FROM public.account
WHERE account_id = (
    SELECT account_id
    FROM public.account
    WHERE account_email = 'tony@starkent.com'
  );
-- 4) Fix GM Hummer description using REPLACE (single UPDATE)
UPDATE public.inventory
SET inv_description = REPLACE(
    inv_description,
    'small interiors',
    'a huge interior'
  )
WHERE inv_id = (
    SELECT inv_id
    FROM public.inventory
    WHERE inv_make = 'GM'
      AND inv_model = 'Hummer'
  );
-- 5) Inner join: make, model, and classification for the Sport category (should return 2 rows)
SELECT i.inv_make,
  i.inv_model,
  c.classification_name
FROM public.inventory i
  JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- 6) Add /vehicles/ into both image paths (single UPDATE for all rows)
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');