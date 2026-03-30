describe('Contact Form', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('form').should('be.visible');
  });

  it('should submit the contact form successfully', () => {
    // Intercept the contact form submission
    cy.intercept('POST', '/api/contact', {
      statusCode: 200,
      body: { message: 'Message sent successfully' },
    }).as('submitForm');

    // Fill out the form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('textarea[name="message"]').type('This is a test message');

    // Submit the form
    cy.get('form').submit();

    // Wait for the request and verify
    cy.wait('@submitForm').then((interception) => {
      expect(interception.request.headers).to.have.property('x-csrf-token');
      expect(interception.request.body).to.deep.equal({
        email: 'test@example.com',
        message: 'This is a test message',
      });
    });

    // Verify success message
    cy.contains('Message sent').should('be.visible');
  });

  it('should handle form submission errors', () => {
    // Intercept the contact form submission with an error
    cy.intercept('POST', '/api/contact', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('submitForm');

    // Fill out the form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('textarea[name="message"]').type('This is a test message');

    // Submit the form
    cy.get('form').submit();

    // Verify error message
    cy.contains('Failed to send').should('be.visible');
  });

  it('should validate required fields', () => {
    // Submit empty form
    cy.get('form').submit();

    // Check for validation messages
    cy.get('form').within(() => {
      cy.get('input[name="email"]:invalid').should('exist');
      cy.get('textarea[name="message"]:invalid').should('exist');
    });
  });

  it('should validate email format', () => {
    // Try submitting with invalid email
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('textarea[name="message"]').type('Test message');
    cy.get('form').submit();

    // Check for validation message
    cy.get('input[name="email"]:invalid').should('exist');
  });
}); 