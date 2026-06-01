UPDATE tasks SET status='Ready for Review' WHERE id=89 AND status='Pending';
INSERT INTO comments (task_id, user_id, body) VALUES (89, 1, 'Implemented Shopify UI: added disabled home section and new main landing page template with SVG map and Vanilla JS functionality. Pushed to theme 148264910893.');
