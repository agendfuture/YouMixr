class PlaylistsController < ApplicationController
  # GET /playlists
  # GET /playlists.json
  def index
    if (@playlists = Playlist.where(published: :t)).nil?
      respond_to do |format|
        format.html {redirect_to run_path }
      end
    else
      @playlists = @playlists.joins(:user).select("playlists.*, users.name as username")
      respond_to do |format|
        format.html # index.html.erb
        format.json { render json: @playlists }
      end
    end
  end

  # GET /playlists/1
  # GET /playlists/1.json
  def show
    @playlist = Playlist.find(params[:id])

    @username = User.find(@playlist.creator).name

    @songs = Song.joins(:playlist_entries).where(playlist_entries: {playlist_id: @playlist.id}).select("playlist_entries.id as pl_id, songs.*")

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @playlist }
    end
  end

  # GET /playlists/new
  # GET /playlists/new.json
  def new
    if logged_in
      @playlist = Playlist.new

      respond_to do |format|
        format.html # new.html.erb
        format.json { render json: @playlist }
      end
    else 
      respond_to do |format|
        format.html {redirect_to run_path, notice: 'You have to login to create playlists!'}
      end
    end
  end

  # GET /playlists/1/edit
  def edit
    if logged_in
      @playlist = Playlist.find(params[:id])
      @username = User.find(@playlist.creator)
    else 
      respond_to do |format|
        format.html {redirect_to run_path, notice: 'You have to login to edit playlists!'}
      end
    end
  end

  # POST /playlists
  # POST /playlists.json
  def create
    if logged_in
      if !params[:playlist][:title].blank?
        @playlist = Playlist.new(:title => params[:playlist][:title], :creator => current_user.id)
        @playlist.update_attributes(params[:playlist])

        respond_to do |format|
          if @playlist.save
            session[:playlist] = @playlist

            format.html { redirect_to @playlist, notice: 'Playlist was successfully created.' }
            format.json { render json: @playlist, status: :created, location: @playlist }
          else
            format.html { render action: "new" }
            format.json { render json: @playlist.errors, status: :unprocessable_entity }
          end
        end
      else
        respond_to do |format|
          format.html {redirect_to run_path, notice: 'Cannot create a playlist without a name!'}
        end
      end
    else 
      respond_to do |format|
        format.html {redirect_to run_path, notice: 'You have to login to create playlists!'}
      end
    end
  end

  # PUT /playlists/1
  # PUT /playlists/1.json
  def update
    if logged_in
      @playlist = Playlist.find(params[:id])

      respond_to do |format|
        if @playlist.update_attributes(params[:playlist])
          format.html { redirect_to @playlist, notice: 'Playlist was successfully updated.' }
          format.json { head :no_content }
        else
          format.html { render action: "edit" }
          format.json { render json: @playlist.errors, status: :unprocessable_entity }
        end
      end
    else 
      respond_to do |format|
        format.html {redirect_to run_path, notice: 'You have to login to create playlists!'}
      end
    end
  end

  # DELETE /playlists/1
  # DELETE /playlists/1.json
  def destroy
    if logged_in
      @playlist = Playlist.find(params[:id])
      @playlist.destroy

      respond_to do |format|
        format.html { redirect_to playlists_url }
        format.json { head :no_content }
      end
    else 
      respond_to do |format|
        format.html {redirect_to run_path, notice: 'You have to login to create playlists!'}
      end
    end
  end

  #GET /playlists/:id/select
  def select
    if !(session[:playlist] = Playlist.find_by_id(params[:id])).nil?      
      if session[:playlist].published == false
        if !logged_in or (logged_in and session[:playlist].creator != current_user.id)
          flash[:notice] = "The creator of the choosen playlist, marked it as private."
          session[:playlist] = nil
        end        
      end
    else
      flash[:notice] = "There is no playlist with ID " + params[:id]
    end
    redirect_to run_path 
  end
end
