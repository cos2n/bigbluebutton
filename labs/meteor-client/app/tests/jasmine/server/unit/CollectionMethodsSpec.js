describe("Collections", function () {
  beforeEach(function () {
    MeteorStubs.install();
  });

  afterEach(function () {
    MeteorStubs.uninstall();
  });

  //----------------------------------------------------------------------
  // publish.coffee
  //----------------------------------------------------------------------

  it("should all be correctly handled by remove() after calling clearCollections()", function () {
    spyOn(Meteor.Users, "remove");
    spyOn(Meteor.Chat, "remove");
    spyOn(Meteor.Meetings, "remove");
    spyOn(Meteor.Shapes, "remove");
    spyOn(Meteor.Slides, "remove");
    spyOn(Meteor.Presentations, "remove");

    clearCollections();

    expect(Meteor.Users.remove).toHaveBeenCalled();
    expect(Meteor.Chat.remove).toHaveBeenCalled();
    expect(Meteor.Meetings.remove).toHaveBeenCalled();
    expect(Meteor.Shapes.remove).toHaveBeenCalled();
    expect(Meteor.Slides.remove).toHaveBeenCalled();
    expect(Meteor.Presentations.remove).toHaveBeenCalled();
  });

  //----------------------------------------------------------------------
  // chat.coffee
  //----------------------------------------------------------------------

  it("should be handled correctly by insert() on calling addChatToCollection() in case of private chat", function () {
    spyOn(Meteor.Users, "findOne").and.callFake(function(doc) {
      if(doc.userId == "user001") return { _id: "dbid001" };
      else if(doc.userId == "user002") return { _id: "dbid002" };
    });
    spyOn(Meteor.Chat, "insert");

    addChatToCollection("meeting001", {
      from_time: "123",
      from_userid: "user001",
      to_userid: "user002",
      chat_type: "PRIVATE_CHAT",
      message: "Hello!",
      to_username: "Anton",
      from_tz_offset: "240",
      from_color: "0x000000",
      from_username: "Maxim",
      from_lang: "en"
    });

    expect(Meteor.Chat.insert).toHaveBeenCalledWith({
      meetingId: "meeting001",
      message: {
        chat_type: "PRIVATE_CHAT",
        message: "Hello!",
        to_username: "Anton",
        from_tz_offset: "240",
        from_color: "0x000000",
        to_userid: "dbid002",//not "user002"
        from_userid: "dbid001",//not "user001"
        from_time: "123",
        from_username: "Maxim",
        from_lang: "en"
      }
    });
  });

  it("should be handled correctly by insert() on calling addChatToCollection() in case of public chat", function () {
    spyOn(Meteor.Users, "findOne").and.callFake(function(doc) {
      if(doc.userId == "user001") return { _id: "dbid001" };
      else if(doc.userId == "user002") return { _id: "dbid002" };
    });
    spyOn(Meteor.Chat, "insert");

    addChatToCollection("meeting001", {
      from_time: "123",
      from_userid: "user001",
      to_userid: "public_chat_userid",
      chat_type: "PUBLIC_CHAT",
      message: "Hello!",
      to_username: "public_chat_username",
      from_tz_offset: "240",
      from_color: "0x000000",
      from_username: "Maxim",
      from_lang: "en"
    });

    expect(Meteor.Chat.insert).toHaveBeenCalledWith({
      meetingId: "meeting001",
      message: {
        chat_type: "PUBLIC_CHAT",
        message: "Hello!",
        to_username: "public_chat_username",
        from_tz_offset: "240",
        from_color: "0x000000",
        to_userid: "public_chat_userid",
        from_userid: "dbid001",
        from_time: "123",
        from_username: "Maxim",
        from_lang: "en"
      }
    });
  });

  it("should be handled correctly by remove() on calling deletePrivateChatMessages()", function () {
    spyOn(Meteor.Chat, "remove");

    deletePrivateChatMessages("user001", "user002");

    expect(Meteor.Chat.remove).toHaveBeenCalledWith({
      "message.chat_type": "PRIVATE_CHAT",
      $or: [{ "message.from_userid": "user001", "message.to_userid": "user002" },
        { "message.from_userid": "user002", "message.to_userid": "user001" }]
    });
  });

  //----------------------------------------------------------------------
  // meetings.coffee
  //----------------------------------------------------------------------

  it("should not be updated on calling addMeetingToCollection() if the meeting is already in the collection", function () {
    spyOn(Meteor.Meetings, "findOne").and.callFake(function(doc) {
      if(doc.meetingId == "meeting001") return { meetingId: "meeting001" };
      else return undefined;
    });
    spyOn(Meteor.Meetings, "insert");

    addMeetingToCollection("meeting001", "Demo Meeting", false, "12345", "0");

    expect(Meteor.Meetings.insert).not.toHaveBeenCalled();
  });

  it("should be handled correctly by insert() on calling addMeetingToCollection() with a brand new meeting", function () {
    spyOn(Meteor.Meetings, "findOne").and.returnValue(undefined);//collection is empty
    spyOn(Meteor.Meetings, "insert");

    addMeetingToCollection("meeting001", "Demo Meeting", false, "12345", "0");

    expect(Meteor.Meetings.insert).toHaveBeenCalledWith({
      meetingId: "meeting001",
      meetingName: "Demo Meeting",
      intendedForRecording: false,
      currentlyBeingRecorded: false,//default value
      voiceConf: "12345",
      duration: "0"
    });
  });

  it("should not be touched on calling removeMeetingFromCollection() if there is no wanted meeting in the collection", function () {
    spyOn(Meteor.Meetings, "findOne").and.returnValue(undefined);//collection is empty
    spyOn(Meteor.Meetings, "remove");

    removeMeetingFromCollection("meeting001");

    expect(Meteor.Meetings.remove).not.toHaveBeenCalled();
  });

  //TODO: emulate a find() call
  /*it("should be correctly updated after the removeMeetingFromCollection() call", function () {
    spyOn(Meteor.Meetings, "findOne").and.callFake(function(doc) {
      if(doc.meetingId == "meeting001") return { _id: "id001", meetingId: "meeting001" };
      else return undefined;
    });

    spyOn(Meteor.Meetings, "remove");

    removeMeetingFromCollection("meeting001");

    expect(Meteor.Meetings.remove).toHaveBeenCalled();
  });*/

  //----------------------------------------------------------------------
  // shapes.coffee
  //----------------------------------------------------------------------

  it('should be handled correctly by insert() on calling addShapeToCollection() with a text', function () {
    spyOn(Meteor.Shapes, 'find').and.returnValue({
      count: function() {
        return 1;
      }
    });
    spyOn(Meteor.Shapes, 'insert');

    addShapeToCollection('meeting001', 'whiteboard001', {
      shape_type: 'text',
      status: 'textPublished',
      shape: {
        type: 'text',
        textBoxHeight: 24.5,
        backgroundColor: 16777215,
        fontColor: 0,
        status: 'textPublished',
        dataPoints: '36.5,55.0',
        x: 36.5,
        textBoxWidth: 36.0,
        whiteboardId: 'whiteboard001',
        fontSize: 18,
        id: 'shape001',
        y: 55.0,
        calcedFontSize: 3.6,
        text: 'Hello World!',
        background: true
      }
    });

    expect(Meteor.Shapes.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      whiteboardId: 'whiteboard001',
      shape: {
        type: 'text',
        textBoxHeight: 24.5,
        backgroundColor: 16777215,
        fontColor: 0,
        status: 'textPublished',
        dataPoints: '36.5,55.0',
        x: 36.5,
        textBoxWidth: 36.0,
        whiteboardId: 'whiteboard001',
        fontSize: 18,
        id: 'shape001',
        y: 55.0,
        calcedFontSize: 3.6,
        text: 'Hello World!',
        background: true
      }
    });
  });

  it('should be handled correctly by insert() on calling addShapeToCollection() with a finished standard shape', function () {
    spyOn(Meteor.Shapes, 'find').and.returnValue({
      count: function() {
        return 1;
      }
    });
    spyOn(Meteor.Shapes, 'insert');

    addShapeToCollection('meeting001', 'whiteboard001', {
      wb_id: 'whiteboard001',
      shape_type: 'rectangle',
      status: 'DRAW_END',
      id: 'shape001',
      shape: {
        type: 'rectangle',
        status: 'DRAW_END',
        points: [60.0, 17.0, 73.0, 57.5],
        whiteboardId: 'whiteboard001',
        id: 'shape001',
        square: false,
        transparency: false,
        thickness: 10,
        color: 0
      }
    });

    expect(Meteor.Shapes.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      whiteboardId: 'whiteboard001',
      shape: {
        wb_id: 'whiteboard001',
        shape_type: 'rectangle',
        status: 'DRAW_END',
        id: 'shape001',
        shape: {
          type: 'rectangle',
          status: 'DRAW_END',
          points: [60.0, 17.0, 73.0, 57.5],
          whiteboardId: 'whiteboard001',
          id: 'shape001',
          square: false,
          transparency: false,
          thickness: 10,
          color: 0
        }
      }
    });
  });

  it('should be handled correctly by insert() on calling addShapeToCollection() with a pencil being used', function () {
    spyOn(Meteor.Shapes, 'find').and.returnValue({
      count: function() {
        return 1;
      }
    });
    spyOn(Meteor.Shapes, 'insert');

    addShapeToCollection('meeting001', 'whiteboard001', {
      wb_id: 'whiteboard001',
      shape_type: 'pencil',
      status: 'DRAW_START',
      id: 'shape001',
      shape: {
        type: 'pencil',
        status: 'DRAW_START',
        points: [35.8, 63.6, 36.1, 63.4, 36.2, 63.2],
        whiteboardId: 'whiteboard001',
        id: 'shape001',
        square: undefined,
        transparency: false,
        thickness: 10,
        color: 0
      }
    });

    expect(Meteor.Shapes.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      whiteboardId: 'whiteboard001',
      shape: {
        wb_id: 'whiteboard001',
        shape_type: 'pencil',
        status: 'DRAW_START',
        id: 'shape001',
        shape: {
          type: 'pencil',
          status: 'DRAW_START',
          points: [35.8, 63.6, 36.1, 63.4, 36.2, 63.2],
          whiteboardId: 'whiteboard001',
          id: 'shape001',
          square: undefined,
          transparency: false,
          thickness: 10,
          color: 0
        }
      }
    });
  });


  //----------------------------------------------------------------------
  // presentation.coffee
  //----------------------------------------------------------------------

  it("should be handled correctly by insert() on calling addPresentationToCollection()", function (){
    spyOn(Meteor.Presentations, "findOne").and.returnValue(undefined)

    spyOn(Meteor.Presentations, "insert");

    addPresentationToCollection("meeting001", {
      id: "presentation001",
      name: "Presentation 001",
      current: true
    });

    expect(Meteor.Presentations.insert).toHaveBeenCalledWith({
      meetingId: "meeting001",
      presentation: {
        id: "presentation001",
        name: "Presentation 001",
        current: true
      },
      pointer: {
        x: 0.0,
        y: 0.0
      }
    });
  });

  it("should be handled correctly on calling addPresentationToCollection() when presentation is already in the collection", function (){
    spyOn(Meteor.Presentations, "findOne").and.returnValue({ _id: "dbid001" });

    spyOn(Meteor.Presentations, "insert");

    addPresentationToCollection("meeting001", {
      id: "presentation001",
      name: "Presentation 001",
      current: true
    });

    expect(Meteor.Presentations.insert).not.toHaveBeenCalledWith({
      meetingId: "meeting001",
      presentation: {
        id: "presentation001",
        name: "Presentation 001",
        current: true
      },
      pointer: {
        x: 0.0,
        y: 0.0
      }
    });
  });

  it("should be handled correctly by remove() on calling removePresentationFromCollection", function (){
    spyOn(Meteor.Presentations, "findOne").and.returnValue({ _id: "dbid001" });
    spyOn(Meteor.Presentations, "remove");

    removePresentationFromCollection("meeting0001", "presentation001");

    expect(Meteor.Presentations.remove).toHaveBeenCalled();
  });

  it("should be handled correctly by remove() on calling removePresentationFromCollection", function (){
    spyOn(Meteor.Presentations, "findOne").and.returnValue(undefined);
    spyOn(Meteor.Presentations, "remove");

    removePresentationFromCollection("meeting0001", "presentation001");

    expect(Meteor.Presentations.remove).not.toHaveBeenCalled();
  });
});
