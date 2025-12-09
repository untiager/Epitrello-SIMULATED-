const { pool } = require('./db');

const defaultTemplates = [
  {
    name: 'Kanban Board',
    description: 'Classic Kanban workflow with To Do, In Progress, and Done columns',
    lists: [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 }
    ],
    cards: []
  },
  {
    name: 'Project Management',
    description: 'Complete project management setup with planning, execution, and review phases',
    lists: [
      { title: 'Backlog', position: 0 },
      { title: 'Planning', position: 1 },
      { title: 'In Development', position: 2 },
      { title: 'Testing', position: 3 },
      { title: 'Completed', position: 4 }
    ],
    cards: []
  },
  {
    name: 'Sprint Planning',
    description: 'Agile sprint board with story points and sprint goals',
    lists: [
      { title: 'Sprint Backlog', position: 0 },
      { title: 'To Do', position: 1 },
      { title: 'In Progress', position: 2 },
      { title: 'Review', position: 3 },
      { title: 'Done', position: 4 }
    ],
    cards: []
  },
  {
    name: 'Simple To-Do',
    description: 'Simple task management with two columns',
    lists: [
      { title: 'To Do', position: 0 },
      { title: 'Done', position: 1 }
    ],
    cards: []
  },
  {
    name: 'Bug Tracking',
    description: 'Track and manage software bugs and issues',
    lists: [
      { title: 'New Issues', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Testing', position: 2 },
      { title: 'Resolved', position: 3 },
      { title: 'Closed', position: 4 }
    ],
    cards: []
  }
];

async function seedTemplates() {
  const client = await pool.connect();
  try {
    console.log('Checking for default templates...');
    
    // Check if templates already exist
    const existingTemplates = await client.query('SELECT COUNT(*) FROM board_templates');
    if (parseInt(existingTemplates.rows[0].count) > 0) {
      console.log('Templates already exist. Skipping seeding.');
      return;
    }

    console.log('Seeding default templates...');

    for (const template of defaultTemplates) {
      await client.query('BEGIN');
      
      try {
        // Create template data structure
        const templateData = {
          board: { name: template.name, description: template.description },
          lists: template.lists,
          cards: template.cards
        };

        await client.query(
          `INSERT INTO board_templates (name, description, template_data, is_public) 
           VALUES ($1, $2, $3, true)`,
          [template.name, template.description, JSON.stringify(templateData)]
        );

        await client.query('COMMIT');
        console.log(`✓ Created template: ${template.name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Failed to create template: ${template.name}`, error);
      }
    }

    console.log('Template seeding completed!');
  } catch (error) {
    console.error('Error during template seeding:', error);
  } finally {
    client.release();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTemplates()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedTemplates };
