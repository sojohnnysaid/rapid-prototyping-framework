import { db } from './db'
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Change request handlers
  http.get('/api/change-requests', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const requestedByRole = url.searchParams.get('requestedByRole')
    
    let changeRequests = db.changeRequest.getAll()
    
    if (status) {
      changeRequests = changeRequests.filter(cr => cr.status === status)
    }
    
    if (requestedByRole) {
      changeRequests = changeRequests.filter(cr => cr.requestedByRole === requestedByRole)
    }
    
    return HttpResponse.json(changeRequests)
  }),
  
  http.get('/api/change-requests/:id', ({ params }) => {
    const { id } = params
    const changeRequest = db.changeRequest.findFirst({ where: { id: { equals: Number(id) } } })
    
    if (!changeRequest) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(changeRequest)
  }),
  
  http.post('/api/change-requests', async ({ request }) => {
    const data = await request.json()
    
    // Ensure targetId is a number
    if (data.targetId) {
      data.targetId = parseInt(data.targetId, 10);
    }
    
    // Generate a new ID if not provided
    if (!data.id) {
      data.id = Math.floor(Math.random() * 1000) + 5000 // Random ID starting from 5000
    }
    
    const newChangeRequest = db.changeRequest.create(data)
    
    // Get applicant information to include in notification
    const applicant = db.applicant.findFirst({ 
      where: { id: { equals: Number(data.targetId) } } 
    })
    
    const applicantName = applicant ? applicant.name : `Applicant #${data.targetId}`;
    
    // Create notification for program officers
    if (data.requestType === 'eligibility') {
      db.notification.create({
        id: Math.floor(Math.random() * 1000) + 6000,
        description: `New eligibility change request for ${applicantName} from ${data.requestedByName}`,
        status: 'unread',
        type: 'change-request-new',
        targetRole: 'programOfficer',
        relatedId: newChangeRequest.id,
        date: new Date().toISOString(),
        link: '/change-approval'
      })
    }
    
    // Create confirmation notification for the requester (applicant reviewer)
    db.notification.create({
      id: Math.floor(Math.random() * 1000) + 6500,
      description: `You submitted a change request for ${applicantName} (${data.currentValue} → ${data.requestedValue})`,
      status: 'unread',
      type: 'change-request-submitted',
      targetRole: data.requestedByRole,
      relatedId: newChangeRequest.id,
      date: new Date().toISOString(),
      link: '/change-request'
    })
    
    return HttpResponse.json(newChangeRequest, { status: 201 })
  }),
  
  http.put('/api/change-requests/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    
    const changeRequest = db.changeRequest.findFirst({ where: { id: { equals: Number(id) } } })
    
    if (!changeRequest) {
      return new HttpResponse(null, { status: 404 })
    }
    
    const updatedChangeRequest = db.changeRequest.update({ 
      where: { id: { equals: Number(id) } }, 
      data: updates 
    })
    
    // Create notification for requester (applicant reviewer)
    db.notification.create({
      id: Math.floor(Math.random() * 1000) + 7000,
      description: `Your change request for applicant #${changeRequest.targetId} has been ${updates.status}`,
      status: 'unread',
      type: 'change-request',
      targetRole: changeRequest.requestedByRole,
      relatedId: changeRequest.id,
      date: new Date().toISOString(),
      link: '/change-request'
    })
    
    // Get applicant information to include in notification
    const applicant = db.applicant.findFirst({ 
      where: { id: { equals: Number(changeRequest.targetId) } } 
    })
    
    const applicantName = applicant ? applicant.name : `Applicant #${changeRequest.targetId}`;
    
    // If approved, create a notification for all program officers
    if (updates.status === 'approved') {
      db.notification.create({
        id: Math.floor(Math.random() * 1000) + 8000,
        description: `Change request for ${applicantName} has been approved (${changeRequest.currentValue} → ${changeRequest.requestedValue})`,
        status: 'unread',
        type: 'change-request-approved',
        targetRole: 'programOfficer',
        relatedId: changeRequest.id,
        date: new Date().toISOString(),
        link: '/dashboard'
      })
    }
    
    // If rejected, create a different notification for program officers
    if (updates.status === 'rejected') {
      db.notification.create({
        id: Math.floor(Math.random() * 1000) + 8000,
        description: `Change request for ${applicantName} has been rejected`,
        status: 'unread',
        type: 'change-request-rejected',
        targetRole: 'programOfficer', 
        relatedId: changeRequest.id,
        date: new Date().toISOString(),
        link: '/dashboard'
      })
    }
    
    return HttpResponse.json(updatedChangeRequest)
  }),
  
  // Notification handlers
  http.get('/api/notifications', ({ request }) => {
    const url = new URL(request.url)
    const targetRole = url.searchParams.get('targetRole')
    
    let notifications = db.notification.getAll()
    
    if (targetRole) {
      // Special case for admin - show all notifications
      if (targetRole === 'admin') {
        // No filtering, admins see all notifications
      } else {
        notifications = notifications.filter(n => n.targetRole === targetRole)
      }
    }
    
    // Sort by date - newest first
    notifications.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });
    
    return HttpResponse.json(notifications)
  }),
  
  http.post('/api/notifications', async ({ request }) => {
    const data = await request.json()
    
    // Generate a new ID if not provided
    if (!data.id) {
      data.id = Math.floor(Math.random() * 1000) + 8000 // Random ID starting from 8000
    }
    
    const newNotification = db.notification.create(data)
    return HttpResponse.json(newNotification, { status: 201 })
  }),
  
  http.put('/api/notifications/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    
    const updatedNotification = db.notification.update({ 
      where: { id: { equals: Number(id) } }, 
      data: updates 
    })
    
    return HttpResponse.json(updatedNotification)
  }),
  // User management handlers
  http.get('/api/users', () => {
    return HttpResponse.json(db.user.getAll())
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params
    const user = db.user.findFirst({ where: { id: { equals: Number(id) } } })
    
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(user)
  }),

  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json()
    // Generate a new ID if not provided
    if (!newUser.id) {
      newUser.id = Math.floor(Math.random() * 1000) + 100 // Random ID between 100-1100
    }
    const createdUser = db.user.create(newUser)
    return HttpResponse.json(createdUser, { status: 201 })
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    const updatedUser = db.user.update({ 
      where: { id: { equals: Number(id) } }, 
      data: updates 
    })
    return HttpResponse.json(updatedUser)
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params
    db.user.delete({ where: { id: { equals: Number(id) } } })
    return new HttpResponse(null, { status: 204 })
  }),
  // Applicant handlers
  http.get('/api/applicants', ({ request }) => {
    const url = new URL(request.url)
    const fieldOfStudy = url.searchParams.get('fieldOfStudy')
    
    if (fieldOfStudy) {
      const filteredApplicants = db.applicant.findMany({
        where: { fieldOfStudy: { equals: fieldOfStudy } }
      })
      return HttpResponse.json(filteredApplicants)
    }
    
    return HttpResponse.json(db.applicant.getAll())
  }),

  http.get('/api/applicants/:id', ({ params }) => {
    const { id } = params
    const applicant = db.applicant.findFirst({ where: { id: { equals: Number(id) } } })
    
    if (!applicant) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(applicant)
  }),

  http.post('/api/applicants', async ({ request }) => {
    const newApplicant = await request.json()
    const createdApplicant = db.applicant.create(newApplicant)
    return HttpResponse.json(createdApplicant, { status: 201 })
  }),

  http.put('/api/applicants/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    const updatedApplicant = db.applicant.update({ 
      where: { id: { equals: Number(id) } }, 
      data: updates 
    })
    return HttpResponse.json(updatedApplicant)
  }),

  http.delete('/api/applicants/:id', ({ params }) => {
    const { id } = params
    db.applicant.delete({ where: { id: { equals: Number(id) } } })
    return new HttpResponse(null, { status: 204 })
  }),

  // Reviewer handlers
  http.get('/api/reviewers', ({ request }) => {
    const url = new URL(request.url)
    const expertise = url.searchParams.get('expertise')
    
    if (expertise) {
      console.log(`MSW: Filtering reviewers by expertise: ${expertise}`)
      
      // First get all reviewers to debug
      const allReviewers = db.reviewer.getAll()
      console.log('MSW: All reviewers:', allReviewers)
      
      // Try a simpler filtering approach for debugging
      const filteredReviewers = allReviewers.filter(
        rev => rev.expertise === expertise || rev.secondaryExpertise === expertise
      )
      console.log('MSW: Filtered reviewers:', filteredReviewers)
      
      return HttpResponse.json(filteredReviewers)
    }
    
    return HttpResponse.json(db.reviewer.getAll())
  }),

  http.get('/api/reviewers/:id', ({ params }) => {
    const { id } = params
    const reviewer = db.reviewer.findFirst({ where: { id: { equals: Number(id) } } })
    
    if (!reviewer) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(reviewer)
  }),

  http.post('/api/reviewers', async ({ request }) => {
    const newReviewer = await request.json()
    const createdReviewer = db.reviewer.create(newReviewer)
    return HttpResponse.json(createdReviewer, { status: 201 })
  }),

  http.put('/api/reviewers/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    const updatedReviewer = db.reviewer.update({ 
      where: { id: { equals: Number(id) } }, 
      data: updates 
    })
    return HttpResponse.json(updatedReviewer)
  }),

  http.delete('/api/reviewers/:id', ({ params }) => {
    const { id } = params
    db.reviewer.delete({ where: { id: { equals: Number(id) } } })
    return new HttpResponse(null, { status: 204 })
  }),

  // Assignment handling
  http.post('/api/assign-reviewer', async ({ request }) => {
    const { applicantId, reviewerId } = await request.json()
    
    // Validate input
    if (!applicantId || !reviewerId) {
      return new HttpResponse(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }
    
    // Find the applicant and reviewer
    const applicant = db.applicant.findFirst({ where: { id: { equals: Number(applicantId) } } })
    const reviewer = db.reviewer.findFirst({ where: { id: { equals: Number(reviewerId) } } })
    
    if (!applicant) {
      return new HttpResponse(JSON.stringify({ error: 'Applicant not found' }), { status: 404 })
    }
    
    if (!reviewer) {
      return new HttpResponse(JSON.stringify({ error: 'Reviewer not found' }), { status: 404 })
    }
    
    // Check if reviewer has capacity
    if (reviewer.currentAssignments >= reviewer.maxAssignments) {
      return new HttpResponse(JSON.stringify({ 
        error: 'Reviewer has reached maximum assignments'
      }), { status: 400 })
    }
    
    // Update the applicant with assigned reviewer
    const updatedApplicant = db.applicant.update({
      where: { id: { equals: Number(applicantId) } },
      data: { reviewer: reviewer }
    })
    
    // Update the reviewer's assignment count
    const updatedReviewer = db.reviewer.update({
      where: { id: { equals: Number(reviewerId) } },
      data: { currentAssignments: reviewer.currentAssignments + 1 }
    })
    
    // Create notification entry (in a real app, this would send an email)
    const notification = {
      id: Date.now(),
      reviewerId: reviewerId,
      applicantId: applicantId,
      message: `You have been assigned to review application from ${applicant.name}`,
      timestamp: new Date().toISOString()
    }
    
    return HttpResponse.json({
      success: true,
      applicant: updatedApplicant,
      reviewer: updatedReviewer,
      notification
    })
  }),
  
  // ReviewerMatching handlers
  http.get('/api/reviewerMatching', () => {
    return HttpResponse.json(db.reviewerMatching.getAll())
  }),

  http.get('/api/reviewerMatching/:id', ({ params }) => {
    const { id } = params
    const matching = db.reviewerMatching.findFirst({ where: { id: { equals: Number(id) } } })
    
    if (!matching) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(matching)
  }),

  http.post('/api/reviewerMatching', async ({ request }) => {
    const newMatching = await request.json()
    const createdMatching = db.reviewerMatching.create(newMatching)
    return HttpResponse.json(createdMatching, { status: 201 })
  }),

  http.put('/api/reviewerMatching/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    const updatedMatching = db.reviewerMatching.update({ 
      where: { id: { equals: Number(id) } }, 
      data: updates 
    })
    return HttpResponse.json(updatedMatching)
  }),

  http.delete('/api/reviewerMatching/:id', ({ params }) => {
    const { id } = params
    db.reviewerMatching.delete({ where: { id: { equals: Number(id) } } })
    return new HttpResponse(null, { status: 204 })
  })
]
