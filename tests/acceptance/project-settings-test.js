import { test } from 'qunit';
import moduleForAcceptance from 'code-corps-ember/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'code-corps-ember/tests/helpers/ember-simple-auth';
import createProjectWithSluggedRoute from 'code-corps-ember/tests/helpers/mirage/create-project-with-slugged-route';
import projectSettingsPage from '../pages/project/settings/profile';

moduleForAcceptance('Acceptance | Project Settings - Profile');

test('it requires authentication', function(assert) {
  assert.expect(1);

  let project = createProjectWithSluggedRoute();

  projectSettingsPage.visit({
    organization: project.organization.slug,
    project: project.slug
  });

  andThen(() => {
    assert.equal(currentRouteName(), 'login');
  });
});

test('it allows editing of project profile', function(assert) {
  assert.expect(4);

  let user = server.create('user');

  let project = createProjectWithSluggedRoute();

  server.create('organizationMembership', {
    member: user,
    organization: project.organization,
    role: 'admin'
  });

  authenticateSession(this.application, { user_id: user.id });

  projectSettingsPage.visit({
    organization: project.organization.slug,
    project: project.slug
  });

  andThen(() => {
    projectSettingsPage.projectSettingsForm
      .title('Edited Project')
      .description('Lorem edit')
      .clickSave();
  });

  let done = assert.async();

  server.patch('/projects/1', function(schema, request) {
    let attrs = this.normalizedRequestAttrs();

    assert.equal(attrs.title, 'Edited Project');
    assert.equal(attrs.description, 'Lorem edit');
    done();

    return this._getJsonApiDocForRequest(request, 'project');
  });

  andThen(() => {
    assert.ok(projectSettingsPage.successAlert.isVisible);
    assert.equal(projectSettingsPage.successAlert.message, 'Project updated successfully');
  });
});

test("it allows editing of project's image", function(assert) {
  assert.expect(4);

  let droppedImageString = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAABMxJREFUSA2NVWlsG1UQ/tZ2nNhuIIGGcMQNaRo3SK2gQQWE1CD6g6o/ECqqkDikqhKVyK+qPzhSSiX4EQ5xCUuIowgKUkMEUQD1R4RAqkQjklB6JKGuHaLgxMSJE8d2Dh/r3R3m7XodO7VTRrs7772ZN9+8mXmzEjHh/5Cutl5VAvjJfcpasZWVmALS2IaFX2FNt2hK1riuU16+AUjOawHARJkokJoFZeM8USFZXUDVbZAc9YDFbgCaDhmz/LckCOWUhW+UuAaKnGV+CiT7AT6YTiyUxG7nEUibD8JStwewOXLCYiatz4kAkIT3lIE6+Q0QOSIch+TcB7geAyob2PMKIBsDkpdBK15AyG86BEvjq8xbGEFEoSC0AsQkTdP0YTyZouDwy0SDHJ2L+0gN/0qavGyqFXCN1HiAlGtdlD0PUv5sI5KXcnLDlpjA3KHR2mJX79uEF0HBwaNEqTlThVKhGYoNX6TFgSFa9rHxVDovU6d6SYuNGfOcs6YwD6Kqqr527so5wlHQE96nKBxb1Ncy4TBNdnnpr6rHaQQP8rubRtFO/qePUfS330lTjL2m0fVczwkvch4kZLIZHP78ELqDPRh9YQQ7mnZiKjiNyQOduP3SFNSHGmGp5GyLkNutUH4J8iCDltleVNbXgTTOp8WoRhbkSV8RIILGQwF0B3rw2n0ndICsLOOTzg/x8aVpRPd6UKFoUBMZDr4GLZiAZcetaPr7awNAOFoCQNgtgvWFfFwxQPv2R4QMIxeuYLi7D45dd+ELfwxzCheXswJqhJW4ohr73oSr+W4+gREJfVOJjw4iQiUouDAFcKm769z63H/5KipQiypZQzKr4aukgrl4GlV2Ce7+d+Da1pQLUUG56juLP0UgK/Iyx5px7MalWlpMMEglsgzgqrYhmUjj06tR2M68geqWJnCxlA1RIYwOYubEaedWkeVUZtO6zqaaaiicWIvDhuxsBs6EhppvT+I03YzIcgpWqxVc+IX2So6LQLbcskXPSWjhX125ZWcr0khBkhVIqwxw+iXUbGtGLLGCj8ZmEVllBzjUNwLSQUz41oZWbnrAwPiAvnTvA7vQtr8dCV8Ed3zXCfvWrZBTaVTbbVjlCvOOzGA+B2RGw7RVyIvuSTKTxLOfPYMfwj/C3+GHx+3BhC+A9y+EYN/ugYvvkShTESAbn2BRVmG1SDh5vxu1jgo+EZdriRrIJ577FpyVTnQ83AGsAu/2v4XVVAzN93jQeWAPWmyEOJdthA3P8xvOKKitsOJJdw1cfDEFCYCSGeJj6mQ2R8FPnHmFcAx0vH+cEilTg+ifWJIGp2N0PrhIY3NLtJzO5oU/BxSaWDDay7rWtdYghbamGUpLK/N0uM9H+JLo4E9pGppSSFby9ooGobhK3kGZcCpNrd9naCltNNpCoOv+JyyEhc+9IgPeIRnHJzgA/DxXL+FRfhuqJdg4yDGu8tEo4fUZFq4Q2jdL+GC3FW0NVj1kham5DkTEVpSkkUAJf0yr6AloeC/Mv0TuJkVB54u7t1bC800W7PdYUeMoNC0sGVQSRIjEHct1G93uTFzDdIIQTXHb4tNu4tZyJ5/KzSAuHgsqV11lQfRdG2w05YIL4wLGdKpQJsY3BDE3CEOlaCPjpv5//TNS9KqAezIAAAAASUVORK5CYII=';

  let user = server.create('user');

  let project = createProjectWithSluggedRoute();

  server.create('organizationMembership', {
    member: user,
    organization: project.organization,
    role: 'admin'
  });

  authenticateSession(this.application, { user_id: user.id });

  projectSettingsPage.visit({
    organization: project.organization.slug,
    project: project.slug
  });

  let done = assert.async();

  server.patch('/projects/1', function(schema, request) {
    let attrs = this.normalizedRequestAttrs();

    assert.equal(attrs.base64IconData, droppedImageString);
    done();

    return this._getJsonApiDocForRequest(request, 'project');
  });

  andThen(() => {
    projectSettingsPage.projectSettingsForm.imageDrop.dropFile(droppedImageString);
    projectSettingsPage.projectSettingsForm.clickSave();
  });

  andThen(() => {
    assert.ok(projectSettingsPage.successAlert.isVisible);
    assert.equal(projectSettingsPage.successAlert.message, 'Project updated successfully');
    assert.equal(projectSettingsPage.projectSettingsForm.imageDrop.backgroundImageData(), `url(${droppedImageString})`);
  });
});
