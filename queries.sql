--  SELECT business_id from review
--  where business_id
--        in (SELECT DISTINCT business_id FROM category LEFT JOIN business on business.id = category.business_id
--  where category.category = 'Hotels'and business.name LIKE '%Hilton%');

-- SELECT DISTINCT category.business_id as business_id,
--   category.category as category,
--   business.name as business_name,
--   business.city as city,
--   business.state as state,
--   business.stars as business_stars,
--   review.stars as review_stars,
--   review.date as review_date,
--   review.user_id as user_id,
--   review.text as text,
--   review.useful as useful_vote,
--   review.funny as funny_vote,
--   review.cool as cool_vote
-- FROM category LEFT JOIN business ON business.id = category.business_id
--   INNER JOIN review ON category.business_id = review.business_id
-- WHERE category.category = 'Hotels' AND business.name LIKE '%Hilton%'


SELECT DISTINCT category.business_id as business_id,
  category.category as category,
  business.name as business_name,
  business.city as city,
  business.state as state,
  business.stars as business_stars,
  review.stars as review_stars,
  review.date as review_date,
  review.user_id as user_id,
  review.text as text,
  review.useful as useful_vote,
  review.funny as funny_vote,
  review.cool as cool_vote
FROM category LEFT JOIN business ON business.id = category.business_id
  INNER JOIN review ON category.business_id = review.business_id
WHERE category.category = 'Hotels' AND business.city LIKE '%Las Vegas%'
 AND business.name LIKE '%Caesars Palace Las Vegas Hotel & Casino%'
AND review.date > '2016'